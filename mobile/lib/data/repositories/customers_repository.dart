import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../models/customer.dart';

final customersRepositoryProvider = Provider<CustomersRepository>(
  (ref) => CustomersRepository(ref.watch(apiClientProvider)),
);

final customersListProvider = FutureProvider.autoDispose
    .family<List<Customer>, ({String? q, CustomerStatus? status})>(
  (ref, args) =>
      ref.watch(customersRepositoryProvider).list(q: args.q, status: args.status),
);

class CustomersRepository {
  CustomersRepository(this._api);
  final ApiClient _api;

  Future<List<Customer>> list({String? q, CustomerStatus? status}) async {
    final res = await _api.get(
      '/seller/customers',
      query: {
        if (q != null && q.isNotEmpty) 'q': q,
        if (status != null) 'status': status.name,
      },
    );
    final body = res.data as Map<String, dynamic>;
    final data = body['data'] as List<dynamic>;
    return data.map((e) => Customer.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Customer> create(Map<String, dynamic> dto) async {
    final res = await _api.post('/seller/customers', data: dto);
    final body = res.data as Map<String, dynamic>;
    return Customer.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<Customer> update(String id, Map<String, dynamic> dto) async {
    final res = await _api.dio.patch('/seller/customers/$id', data: dto);
    final body = res.data as Map<String, dynamic>;
    return Customer.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<void> pause(String id) async {
    await _api.post('/seller/customers/$id/pause');
  }

  Future<void> resume(String id) async {
    await _api.post('/seller/customers/$id/resume');
  }
}
