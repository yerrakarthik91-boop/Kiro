import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/app_localizations.dart';
import '../../core/routing/app_router.dart';
import '../../core/storage/secure_storage.dart';
import '../../data/repositories/dashboard_repository.dart';
import '../../shared/widgets/loading_view.dart';

/// BU-01 Buyer Dashboard, wired to /buyer/dashboard.
class BuyerDashboardScreen extends ConsumerWidget {
  const BuyerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final snapshot = ref.watch(buyerDashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.t('buyer_dashboard')),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(buyerDashboardProvider),
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
          message: 'Could not load dashboard.\n$e\n\n'
              'If this is your first sign-in, link to a seller using their invite code via the API '
              '(POST /v1/buyer/link-seller).',
          onRetry: () => ref.invalidate(buyerDashboardProvider),
        ),
        data: (s) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(buyerDashboardProvider),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                color: theme.colorScheme.primaryContainer,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: theme.colorScheme.primary,
                        child: const Icon(Icons.waving_hand_outlined,
                            color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(l10n.t('welcome'),
                                style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onPrimaryContainer)),
                            Text(
                              s.welcomeName,
                              style: theme.textTheme.titleLarge?.copyWith(
                                color: theme.colorScheme.onPrimaryContainer,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _MilkCard(
                      title: l10n.t('morning_quantity'),
                      value: '${s.morningQuantity.toStringAsFixed(1)} L',
                      icon: Icons.wb_sunny_outlined,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MilkCard(
                      title: l10n.t('evening_quantity'),
                      value: '${s.eveningQuantity.toStringAsFixed(1)} L',
                      icon: Icons.nightlight_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _MilkCard(
                title: l10n.t('monthly_consumption'),
                value: '${s.monthlyConsumption.toStringAsFixed(1)} L',
                icon: Icons.calendar_month_outlined,
                wide: true,
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.receipt_long, color: theme.colorScheme.primary),
                          const SizedBox(width: 8),
                          Text(l10n.t('current_bill'),
                              style: theme.textTheme.titleMedium
                                  ?.copyWith(fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text('₹${s.currentBill.toStringAsFixed(0)}',
                          style: theme.textTheme.displaySmall
                              ?.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('Due ${s.dueDate ?? '—'} · ${s.billStatus}',
                          style: theme.textTheme.bodySmall),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: s.currentBill <= 0
                              ? null
                              : () => context.push(Routes.buyerBills),
                          icon: const Icon(Icons.payments_outlined),
                          label: Text(l10n.t('pay_now')),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _Action(
                    icon: Icons.calendar_month_outlined,
                    label: l10n.t('view_deliveries'),
                    onTap: () => context.push(Routes.calendar),
                  ),
                  _Action(
                    icon: Icons.event_available_outlined,
                    label: 'Manage schedule',
                    onTap: () => context.push(Routes.schedule),
                  ),
                  _Action(
                    icon: Icons.receipt_long_outlined,
                    label: l10n.t('view_bills'),
                    onTap: () => context.push(Routes.buyerBills),
                  ),
                  _Action(
                    icon: Icons.support_agent_outlined,
                    label: l10n.t('raise_complaint'),
                    onTap: () => context.push(Routes.complaintCreate),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (i) {
          switch (i) {
            case 1:
              context.push(Routes.calendar);
              break;
            case 2:
              context.push(Routes.buyerBills);
              break;
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Calendar',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Bills',
          ),
        ],
      ),
    );
  }
}

class _MilkCard extends StatelessWidget {
  const _MilkCard({
    required this.title,
    required this.value,
    required this.icon,
    this.wide = false,
  });

  final String title;
  final String value;
  final IconData icon;
  final bool wide;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: theme.textTheme.bodySmall),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: theme.textTheme.titleLarge
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
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
