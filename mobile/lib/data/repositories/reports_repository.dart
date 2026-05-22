import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';

final reportsRepositoryProvider = Provider<ReportsRepository>(
  (ref) => ReportsRepository(ref.watch(apiClientProvider)),
);

class DailyReport {
  DailyReport({
    required this.date,
    required this.totalMilk,
    required this.morning,
    required this.evening,
    required this.revenue,
    required this.deliveredCount,
    required this.missedCount,
  });

  final String date;
  final double totalMilk;
  final double morning;
  final double evening;
  final double revenue;
  final int deliveredCount;
  final int missedCount;
}

class MonthlyReport {
  MonthlyReport({
    required this.month,
    required this.totalMilk,
    required this.revenueFromDeliveries,
    required this.billed,
    required this.collected,
    required this.pending,
    required this.missedDeliveries,
  });

  final String month;
  final double totalMilk;
  final double revenueFromDeliveries;
  final double billed;
  final double collected;
  final double pending;
  final int missedDeliveries;
}

class PnlBucket {
  PnlBucket({required this.bucket, required this.milk, required this.revenue, required this.profit});
  final String bucket;
  final double milk;
  final double revenue;
  final double profit;
}

class PnlReport {
  PnlReport({required this.series, required this.totalMilk, required this.totalRevenue, required this.totalProfit});
  final List<PnlBucket> series;
  final double totalMilk;
  final double totalRevenue;
  final double totalProfit;
}

class ReportsRepository {
  ReportsRepository(this._api);
  final ApiClient _api;

  Future<DailyReport> daily({String? date}) async {
    final res = await _api.get('/seller/reports/daily', query: {if (date != null) 'date': date});
    final d = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return DailyReport(
      date: d['date'] as String,
      totalMilk: _d(d['total_milk']),
      morning: _d(d['morning']),
      evening: _d(d['evening']),
      revenue: _d(d['revenue']),
      deliveredCount: (d['delivered_count'] as num).toInt(),
      missedCount: (d['missed_count'] as num).toInt(),
    );
  }

  Future<MonthlyReport> monthly({String? month}) async {
    final res = await _api.get('/seller/reports/monthly', query: {if (month != null) 'month': month});
    final d = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return MonthlyReport(
      month: d['month'] as String,
      totalMilk: _d(d['total_milk']),
      revenueFromDeliveries: _d(d['revenue_from_deliveries']),
      billed: _d(d['billed']),
      collected: _d(d['collected']),
      pending: _d(d['pending']),
      missedDeliveries: (d['missed_deliveries'] as num).toInt(),
    );
  }

  Future<PnlReport> profitLoss({String range = 'month'}) async {
    final res = await _api.get('/seller/reports/profit-loss', query: {'range': range});
    final d = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final series = (d['series'] as List<dynamic>)
        .map((e) => e as Map<String, dynamic>)
        .map((e) => PnlBucket(
              bucket: e['bucket'] as String,
              milk: _d(e['milk']),
              revenue: _d(e['revenue']),
              profit: _d(e['profit']),
            ))
        .toList();
    final totals = d['totals'] as Map<String, dynamic>;
    return PnlReport(
      series: series,
      totalMilk: _d(totals['milk']),
      totalRevenue: _d(totals['revenue']),
      totalProfit: _d(totals['profit']),
    );
  }
}

double _d(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v) ?? 0.0;
  return 0.0;
}
