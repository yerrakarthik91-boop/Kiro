import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../models/delivery.dart';

final deliveriesRepositoryProvider = Provider<DeliveriesRepository>(
  (ref) => DeliveriesRepository(ref.watch(apiClientProvider)),
);

class DeliveriesRepository {
  DeliveriesRepository(this._api);
  final ApiClient _api;

  Future<List<Delivery>> listForSeller({
    required String date,
    DeliverySlot? slot,
  }) async {
    final res = await _api.get(
      '/seller/deliveries',
      query: {'date': date, if (slot != null) 'slot': slot.name},
    );
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    return list.map((e) => Delivery.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Delivery> mark(
    String id, {
    required DeliveryStatus status,
    double? deliveredQuantity,
    String? notes,
  }) async {
    final res = await _api.dio.patch(
      '/seller/deliveries/$id',
      data: {
        'status': status.name,
        if (deliveredQuantity != null) 'delivered_quantity': deliveredQuantity,
        if (notes != null) 'notes': notes,
      },
    );
    final body = res.data as Map<String, dynamic>;
    return Delivery.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<void> generateNow() async {
    await _api.post('/seller/deliveries/generate-now');
  }

  Future<List<Delivery>> listForBuyer({String? from, String? to}) async {
    final res = await _api.get(
      '/buyer/deliveries',
      query: {if (from != null) 'from': from, if (to != null) 'to': to},
    );
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    return list.map((e) => Delivery.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, String>> calendar(String month) async {
    final res = await _api.get(
      '/buyer/deliveries/calendar',
      query: {'month': month},
    );
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    final out = <String, String>{};
    for (final e in list) {
      final m = e as Map<String, dynamic>;
      out[m['date'] as String] = m['status'] as String;
    }
    return out;
  }
}
