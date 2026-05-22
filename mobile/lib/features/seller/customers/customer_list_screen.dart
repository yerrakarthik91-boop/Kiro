import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/app_router.dart';
import '../../../data/models/customer.dart';
import '../../../data/repositories/customers_repository.dart';
import '../../../shared/widgets/loading_view.dart';

class CustomerListScreen extends ConsumerStatefulWidget {
  const CustomerListScreen({super.key});

  @override
  ConsumerState<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends ConsumerState<CustomerListScreen> {
  String _q = '';
  CustomerStatus? _status;

  @override
  Widget build(BuildContext context) {
    final args = (q: _q.isEmpty ? null : _q, status: _status);
    final list = ref.watch(customersListProvider(args));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customers'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search by name or phone',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (v) => setState(() => _q = v),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _FilterChip(
                  label: 'All',
                  selected: _status == null,
                  onTap: () => setState(() => _status = null),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Active',
                  selected: _status == CustomerStatus.active,
                  onTap: () => setState(() => _status = CustomerStatus.active),
                ),
                const SizedBox(width: 8),
                _FilterChip(
                  label: 'Paused',
                  selected: _status == CustomerStatus.paused,
                  onTap: () => setState(() => _status = CustomerStatus.paused),
                ),
              ],
            ),
          ),
          Expanded(
            child: list.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorView(
                message: 'Could not load customers.\n$e',
                onRetry: () => ref.invalidate(customersListProvider(args)),
              ),
              data: (rows) => rows.isEmpty
                  ? EmptyState(
                      message: 'No customers yet.\nAdd your first one.',
                      icon: Icons.people_outline,
                      cta: 'Add customer',
                      onCta: () => context.push(Routes.customerForm),
                    )
                  : RefreshIndicator(
                      onRefresh: () async =>
                          ref.invalidate(customersListProvider(args)),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: rows.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) => _CustomerTile(rows[i]),
                      ),
                    ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(Routes.customerForm),
        icon: const Icon(Icons.add),
        label: const Text('Add'),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(label: Text(label), selected: selected, onSelected: (_) => onTap());
  }
}

class _CustomerTile extends StatelessWidget {
  const _CustomerTile(this.c);
  final Customer c;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Text(
            c.name.substring(0, 1).toUpperCase(),
            style: TextStyle(color: theme.colorScheme.onPrimaryContainer),
          ),
        ),
        title: Text(c.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          '${c.phone}\n${_formatQty(c)} · ₹${c.milkRate?.toStringAsFixed(0) ?? '—'}/L',
        ),
        isThreeLine: true,
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: _statusColor(c.status, theme).withOpacity(0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            c.status.name,
            style: TextStyle(
              color: _statusColor(c.status, theme),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        onTap: () => context.push('${Routes.customerForm}?id=${c.id}'),
      ),
    );
  }
}

String _formatQty(Customer c) {
  switch (c.deliveryType) {
    case DeliveryType.morning:
      return 'Morning ${c.morningQuantity} L';
    case DeliveryType.evening:
      return 'Evening ${c.eveningQuantity} L';
    case DeliveryType.both:
      return 'M ${c.morningQuantity} L · E ${c.eveningQuantity} L';
  }
}

Color _statusColor(CustomerStatus s, ThemeData theme) {
  switch (s) {
    case CustomerStatus.active:
      return Colors.green.shade700;
    case CustomerStatus.paused:
      return Colors.orange.shade700;
    case CustomerStatus.due_payment:
      return Colors.red.shade700;
    case CustomerStatus.archived:
      return theme.colorScheme.outline;
  }
}
