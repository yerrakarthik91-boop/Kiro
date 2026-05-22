import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';

final paymentsRepositoryProvider = Provider<PaymentsRepository>(
  (ref) => PaymentsRepository(ref.watch(apiClientProvider)),
);

class PaymentsRepository {
  PaymentsRepository(this._api);
  final ApiClient _api;

  Future<void> recordCash({
    required String customerId,
    String? billId,
    required double amount,
    required String method,
    String? reference,
  }) async {
    await _api.post(
      '/seller/payments',
      data: {
        'customer_id': customerId,
        if (billId != null) 'bill_id': billId,
        'amount': amount,
        'method': method,
        if (reference != null) 'reference': reference,
      },
    );
  }

  /// Mock-online payment flow: intent → verify (no real gateway in v1).
  Future<void> payOnlineMock({required String billId, required double amount}) async {
    await _api.post(
      '/buyer/payments/intent',
      data: {'bill_id': billId, 'method': 'upi', 'gateway': 'mock'},
    );
    await _api.post(
      '/buyer/payments/verify',
      data: {'bill_id': billId, 'amount': amount},
    );
  }
}
