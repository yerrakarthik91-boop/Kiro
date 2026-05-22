import 'package:dio/dio.dart';
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

  Future<
      ({
        Bill bill,
        List<BillItem> items,
        String customerName,
        String? customerPhone,
        String? customerAddress,
      })> detailSeller(String id) async {
    final res = await _api.get('/seller/bills/$id');
    return _parseDetail(res.data as Map<String, dynamic>);
  }

  Future<
      ({
        Bill bill,
        List<BillItem> items,
        String customerName,
        String? customerPhone,
        String? customerAddress,
      })> detailBuyer(String id) async {
    final res = await _api.get('/buyer/bills/$id');
    return _parseDetail(res.data as Map<String, dynamic>);
  }

  /// Streams the server-rendered PDF for a bill. The mobile app passes these
  /// bytes to `Printing.sharePdf` to surface the system share / save sheet.
  Future<List<int>> downloadPdfBytes({
    required String billId,
    required String role,
  }) async {
    final path = role == 'seller'
        ? '/seller/bills/$billId/pdf'
        : '/buyer/bills/$billId/pdf';
    final res = await _api.dio.get<List<int>>(
      path,
      options: Options(responseType: ResponseType.bytes),
    );
    return res.data ?? const <int>[];
  }

  /// Trigger backend bill generation for last month (idempotent per customer).
  /// Returns the count of bills created.
  Future<int> generateNow() async {
    final res = await _api.post('/seller/bills/generate-now');
    final body = res.data as Map<String, dynamic>;
    final data = body['data'] as Map<String, dynamic>;
    final created = data['created'];
    return created is num ? created.toInt() : 0;
  }
}

({
  Bill bill,
  List<BillItem> items,
  String customerName,
  String? customerPhone,
  String? customerAddress,
}) _parseDetail(Map<String, dynamic> body) {
  final data = body['data'] as Map<String, dynamic>;
  final billJson = data['bill'] as Map<String, dynamic>;
  final itemsJson =
      (data['items'] as List<dynamic>).cast<Map<String, dynamic>>();
  final customerJson = data['customer'] as Map<String, dynamic>;
  billJson['customer_name'] = customerJson['name'];
  return (
    bill: Bill.fromJson(billJson),
    items: itemsJson.map(BillItem.fromJson).toList(),
    customerName: (customerJson['name'] ?? '?') as String,
    customerPhone: customerJson['phone'] as String?,
    customerAddress: customerJson['address'] as String?,
  );
}
