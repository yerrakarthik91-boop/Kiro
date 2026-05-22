import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';

final scheduleRepositoryProvider = Provider<ScheduleRepository>(
  (ref) => ScheduleRepository(ref.watch(apiClientProvider)),
);

class ScheduleRepository {
  ScheduleRepository(this._api);
  final ApiClient _api;

  Future<void> pause({
    required DateTime from,
    required DateTime to,
    String? reason,
  }) async {
    await _api.post('/buyer/schedule/pause', data: {
      'from_date': _d(from),
      'to_date': _d(to),
      if (reason != null) 'reason': reason,
    });
  }

  Future<void> vacation({
    required DateTime from,
    required DateTime to,
    String? reason,
  }) async {
    await _api.post('/buyer/schedule/vacation', data: {
      'from_date': _d(from),
      'to_date': _d(to),
      if (reason != null) 'reason': reason,
    });
  }

  Future<void> resume() async {
    await _api.post('/buyer/schedule/resume');
  }

  Future<void> extraRequest({
    required DateTime date,
    required String slot,
    required double quantity,
  }) async {
    await _api.post('/buyer/schedule/extra-request', data: {
      'date': _d(date),
      'slot': slot,
      'quantity': quantity,
    });
  }

  Future<({bool active, String? until, String? type})> status() async {
    final res = await _api.get('/buyer/schedule/status');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return (
      active: data['active'] == true,
      until: data['until'] as String?,
      type: data['type'] as String?,
    );
  }
}

String _d(DateTime d) => d.toIso8601String().substring(0, 10);
