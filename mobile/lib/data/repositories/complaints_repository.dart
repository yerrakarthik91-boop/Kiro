import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../models/complaint.dart';

final complaintsRepositoryProvider = Provider<ComplaintsRepository>(
  (ref) => ComplaintsRepository(ref.watch(apiClientProvider)),
);

class ComplaintsRepository {
  ComplaintsRepository(this._api);
  final ApiClient _api;

  Future<Complaint> createForBuyer({
    required ComplaintCategory category,
    String? description,
  }) async {
    final res = await _api.post('/buyer/complaints', data: {
      'category': category.name,
      if (description != null) 'description': description,
    });
    final body = res.data as Map<String, dynamic>;
    return Complaint.fromJson(body['data'] as Map<String, dynamic>);
  }

  Future<List<Complaint>> listForBuyer() async {
    final res = await _api.get('/buyer/complaints');
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    return list.map((e) => Complaint.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Complaint>> listForSeller() async {
    final res = await _api.get('/seller/complaints');
    final list = (res.data as Map<String, dynamic>)['data'] as List<dynamic>;
    return list.map((e) => Complaint.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> updateStatus({
    required String id,
    required ComplaintStatus status,
    String? resolutionNote,
  }) async {
    await _api.dio.patch('/seller/complaints/$id', data: {
      'status': status.name,
      if (resolutionNote != null) 'resolution_note': resolutionNote,
    });
  }
}
