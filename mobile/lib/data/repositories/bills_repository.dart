import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../models/bill.dart';

final billsRepositoryProvider = Provider<BillsRepository>(
  (ref) => BillsRepository(ref.watch(apiClientProvider)),
);

class BillsRepository {
  BillsRepository(this._api);
  final ApiClient _api;

  Future<List<Bill>> listForSeller({String? status}) async {
    final res = await _api.get(
      '/seller/bills',
      query: {if (status != null) 'status': status},
    );
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    return list.map((e) => Bill.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Bill>> listForBuyer() async {
    final res = await _api.get('/buyer/bills');
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    return list.map((e) => Bill.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<({Bill bill, List<BillItem> items, String customerName, String? customerPhone, String? customerAddress})> detailSeller(
    String id,
  ) async {
    final res = await _api.get('/seller/bills/$id');
    return _parseDetail(res.data as Map<String, dynamic>);
  }

  Future<({Bill bill, List<BillItem> items, String customerName, String? customerPhone, String? customerAddress})> detailBuyer(
    String id,
  ) async {
    final res = await _api.get('/buyer/bills/$id');
    return _parseDetail(res.data as Map<String, dynamic>);
  }

  Future<Bill> generateNow() async {
    final res = await _api.post('/seller/bills/generate-now');
    final body = res.data as Map<String, dynamic>;
    // Generate-now returns { created: N }, not a single bill — caller should
    // re-fetch the list. We return null-ish via a synthetic bill for typing.
    return Bill.fromJson({
      'id': '00000000-0000-0000-0000-000000000000',
      'bill_number': 'pending',
      'customer_id': '',
      'period_start': DateTime.now().toIso8601String().substring(0, 10),
      'period_end': DateTime.now().toIso8601String().substring(0, 10),
      'total_amount': 0,
      'paid_amount': 0,
      'status': 'draft',
      ...body['data'] as Map<String, dynamic>,
    });
  }
}

({Bill bill, List<BillItem> items, String customerName, String? customerPhone, String? customerAddress}) _parseDetail(
  Map<String, dynamic> body,
) {
  final data = body['data'] as Map<String, dynamic>;
  final billJson = data['bill'] as Map<String, dynamic>;
  final itemsJson = (data['items'] as List<dynamic>).cast<Map<String, dynamic>>();
  final customerJson = data['customer'] as Map<String, dynamic>;
  // Inject customer_name into the bill JSON so Bill.fromJson can use it.
  billJson['customer_name'] = customerJson['name'];
  return (
    bill: Bill.fromJson(billJson),
    items: itemsJson.map(BillItem.fromJson).toList(),
    customerName: (customerJson['name'] ?? '?') as String,
    customerPhone: customerJson['phone'] as String?,
    customerAddress: customerJson['address'] as String?,
  );
}
