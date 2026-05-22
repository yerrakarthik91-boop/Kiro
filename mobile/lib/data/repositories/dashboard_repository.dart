import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>(
  (ref) => DashboardRepository(ref.watch(apiClientProvider)),
);

final sellerDashboardProvider = FutureProvider.autoDispose<SellerDashboardSnapshot>(
  (ref) => ref.watch(dashboardRepositoryProvider).seller(),
);

final buyerDashboardProvider = FutureProvider.autoDispose<BuyerDashboardSnapshot>(
  (ref) => ref.watch(dashboardRepositoryProvider).buyer(),
);

class SellerDashboardSnapshot {
  SellerDashboardSnapshot({
    required this.businessName,
    required this.inviteCode,
    required this.totalMilkToday,
    required this.deliveredMilk,
    required this.revenueToday,
    required this.activeCustomers,
    required this.pendingPayments,
    required this.collectionsToday,
    required this.deliveryPending,
    required this.deliveryCompleted,
    required this.deliveryMissed,
  });

  final String businessName;
  final String? inviteCode;
  final double totalMilkToday;
  final double deliveredMilk;
  final double revenueToday;
  final int activeCustomers;
  final double pendingPayments;
  final double collectionsToday;
  final int deliveryPending;
  final int deliveryCompleted;
  final int deliveryMissed;
}

class BuyerDashboardSnapshot {
  BuyerDashboardSnapshot({
    required this.welcomeName,
    required this.morningQuantity,
    required this.eveningQuantity,
    required this.monthlyConsumption,
    required this.currentBill,
    required this.dueDate,
    required this.billStatus,
    required this.linkedSellersCount,
  });

  final String welcomeName;
  final double morningQuantity;
  final double eveningQuantity;
  final double monthlyConsumption;
  final double currentBill;
  final String? dueDate;
  final String billStatus;
  final int linkedSellersCount;
}

class DashboardRepository {
  DashboardRepository(this._api);
  final ApiClient _api;

  Future<SellerDashboardSnapshot> seller() async {
    final res = await _api.get('/seller/dashboard');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final cards = data['cards'] as Map<String, dynamic>;
    final summary = data['delivery_summary'] as Map<String, dynamic>;
    return SellerDashboardSnapshot(
      businessName: (data['business_name'] ?? 'My Dairy') as String,
      inviteCode: data['invite_code'] as String?,
      totalMilkToday: _d(cards['total_milk_today']),
      deliveredMilk: _d(cards['delivered_milk']),
      revenueToday: _d(cards['revenue_today']),
      activeCustomers: (cards['active_customers'] as num).toInt(),
      pendingPayments: _d(cards['pending_payments']),
      collectionsToday: _d(cards['collections_today']),
      deliveryPending: (summary['pending'] as num).toInt(),
      deliveryCompleted: (summary['completed'] as num).toInt(),
      deliveryMissed: (summary['missed'] as num).toInt(),
    );
  }

  Future<BuyerDashboardSnapshot> buyer() async {
    final res = await _api.get('/buyer/dashboard');
    final data = (res.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    final summary = data['milk_summary'] as Map<String, dynamic>;
    final billing = data['billing'] as Map<String, dynamic>;
    return BuyerDashboardSnapshot(
      welcomeName: (data['welcome_name'] ?? 'Customer') as String,
      morningQuantity: _d(summary['morning_quantity']),
      eveningQuantity: _d(summary['evening_quantity']),
      monthlyConsumption: _d(summary['monthly_consumption']),
      currentBill: _d(billing['current_bill']),
      dueDate: billing['due_date'] as String?,
      billStatus: (billing['status'] ?? 'paid') as String,
      linkedSellersCount: (data['linked_sellers_count'] as num? ?? 0).toInt(),
    );
  }
}

double _d(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v) ?? 0.0;
  return 0.0;
}
