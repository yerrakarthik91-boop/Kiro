import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/app_localizations.dart';
import '../../core/routing/app_router.dart';
import '../../core/storage/secure_storage.dart';
import '../../data/repositories/dashboard_repository.dart';
import '../../shared/widgets/loading_view.dart';

/// SE-01 Seller Dashboard, wired to /seller/dashboard.
class SellerDashboardScreen extends ConsumerStatefulWidget {
  const SellerDashboardScreen({super.key});

  @override
  ConsumerState<SellerDashboardScreen> createState() => _SellerDashboardScreenState();
}

class _SellerDashboardScreenState extends ConsumerState<SellerDashboardScreen> {
  int _navIndex = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final snapshot = ref.watch(sellerDashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.t('seller_dashboard')),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(sellerDashboardProvider),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(secureStorageProvider).clear();
              if (context.mounted) context.go(Routes.userSelection);
            },
          ),
        ],
      ),
      body: snapshot.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(
          message: 'Could not load dashboard.\n$e',
          onRetry: () => ref.invalidate(sellerDashboardProvider),
        ),
        data: (s) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(sellerDashboardProvider),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (s.inviteCode != null)
                Card(
                  color: theme.colorScheme.primaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        const Icon(Icons.qr_code),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(s.businessName,
                                  style: theme.textTheme.titleMedium),
                              Text(
                                'Invite code: ${s.inviteCode}',
                                style: theme.textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.45,
                children: [
                  _SummaryCard(
                    title: l10n.t('total_milk_today'),
                    value: '${s.totalMilkToday.toStringAsFixed(1)} L',
                    icon: Icons.water_drop_outlined,
                  ),
                  _SummaryCard(
                    title: l10n.t('delivered_milk'),
                    value: '${s.deliveredMilk.toStringAsFixed(1)} L',
                    icon: Icons.check_circle_outline,
                  ),
                  _SummaryCard(
                    title: l10n.t('revenue_today'),
                    value: '₹${s.revenueToday.toStringAsFixed(0)}',
                    icon: Icons.payments_outlined,
                  ),
                  _SummaryCard(
                    title: l10n.t('active_customers'),
                    value: '${s.activeCustomers}',
                    icon: Icons.people_alt_outlined,
                  ),
                  _SummaryCard(
                    title: l10n.t('pending_payments'),
                    value: '₹${s.pendingPayments.toStringAsFixed(0)}',
                    icon: Icons.schedule_outlined,
                  ),
                  _SummaryCard(
                    title: l10n.t('collections_today'),
                    value: '₹${s.collectionsToday.toStringAsFixed(0)}',
                    icon: Icons.savings_outlined,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.local_shipping_outlined),
                  title: const Text('Delivery summary'),
                  subtitle: Text(
                    'Pending ${s.deliveryPending} · Completed ${s.deliveryCompleted} · Missed ${s.deliveryMissed}',
                  ),
                  onTap: () => context.push(Routes.deliveryReport),
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _Action(
                    icon: Icons.person_add_alt,
                    label: 'Add Customer',
                    onTap: () => context.push(Routes.customerForm),
                  ),
                  _Action(
                    icon: Icons.local_shipping_outlined,
                    label: 'Mark Deliveries',
                    onTap: () => context.push(Routes.deliveryReport),
                  ),
                  _Action(
                    icon: Icons.receipt_long_outlined,
                    label: 'Bills',
                    onTap: () => context.push(Routes.bills),
                  ),
                  _Action(
                    icon: Icons.people_outline,
                    label: 'Customers',
                    onTap: () => context.push(Routes.customers),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _navIndex,
        onDestinationSelected: (i) {
          setState(() => _navIndex = i);
          switch (i) {
            case 1:
              context.push(Routes.customers);
              break;
            case 2:
              context.push(Routes.deliveryReport);
              break;
            case 3:
              context.push(Routes.bills);
              break;
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: 'Customers',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_shipping_outlined),
            selectedIcon: Icon(Icons.local_shipping),
            label: 'Delivery',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Billing',
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.title,
    required this.value,
    required this.icon,
  });
  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            Text(value,
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.w700)),
            Text(title, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _Action extends StatelessWidget {
  const _Action({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: scheme.secondaryContainer,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: scheme.onSecondaryContainer, size: 20),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: scheme.onSecondaryContainer)),
          ],
        ),
      ),
    );
  }
}
