import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/app_localizations.dart';
import '../../core/routing/app_router.dart';
import '../../core/storage/secure_storage.dart';

/// SE-01 Seller Dashboard (skeleton).
///
/// Shows the layout from docs/06-Mobile-App-Screens.md (summary cards,
/// quick actions, charts, delivery summary) with placeholder values.
/// Real data wiring is Phase 2 of the roadmap.
class SellerDashboardScreen extends ConsumerWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.t('seller_dashboard')),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(secureStorageProvider).clear();
              if (context.mounted) context.go(Routes.userSelection);
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SectionHeader(text: 'Today'),
          const SizedBox(height: 8),
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
                value: '— L',
                icon: Icons.water_drop_outlined,
              ),
              _SummaryCard(
                title: l10n.t('delivered_milk'),
                value: '— L',
                icon: Icons.check_circle_outline,
              ),
              _SummaryCard(
                title: l10n.t('revenue_today'),
                value: '₹ —',
                icon: Icons.payments_outlined,
              ),
              _SummaryCard(
                title: l10n.t('active_customers'),
                value: '—',
                icon: Icons.people_alt_outlined,
              ),
              _SummaryCard(
                title: l10n.t('pending_payments'),
                value: '₹ —',
                icon: Icons.schedule_outlined,
              ),
              _SummaryCard(
                title: l10n.t('collections_today'),
                value: '₹ —',
                icon: Icons.savings_outlined,
              ),
            ],
          ),
          const SizedBox(height: 24),
          _SectionHeader(text: 'Quick actions'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: const [
              _QuickAction(icon: Icons.person_add_alt, label: 'Add Customer'),
              _QuickAction(icon: Icons.receipt_long, label: 'Generate Bill'),
              _QuickAction(icon: Icons.add_box_outlined, label: 'Add Delivery'),
              _QuickAction(icon: Icons.payments, label: 'Record Payment'),
              _QuickAction(icon: Icons.file_download_outlined, label: 'Export'),
            ],
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Charts',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 160,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'Milk / Revenue / Customer Growth\n(connect to /seller/dashboard/charts)',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: ListTile(
              leading: const Icon(Icons.local_shipping_outlined),
              title: const Text('Delivery summary'),
              subtitle: const Text('Pending — · Completed — · Missed —'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (_) {},
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
          NavigationDestination(
            icon: Icon(Icons.menu),
            selectedIcon: Icon(Icons.menu_open),
            label: 'More',
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
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
            Text(
              value,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(title, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () {},
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
