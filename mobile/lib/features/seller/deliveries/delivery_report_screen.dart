import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/delivery.dart';
import '../../../data/repositories/deliveries_repository.dart';
import '../../../shared/widgets/loading_view.dart';

/// SE-02 Delivery Report. Tap = Delivered, swipe-left = Missed,
/// long-press = Edit Quantity. Footer summary updates live.
class DeliveryReportScreen extends ConsumerStatefulWidget {
  const DeliveryReportScreen({super.key});

  @override
  ConsumerState<DeliveryReportScreen> createState() =>
      _DeliveryReportScreenState();
}

class _DeliveryReportScreenState extends ConsumerState<DeliveryReportScreen> {
  late DateTime _date;
  DeliverySlot? _slot = DeliverySlot.morning;
  late Future<List<Delivery>> _future;

  @override
  void initState() {
    super.initState();
    _date = DateTime.now();
    _refresh();
  }

  void _refresh() {
    final dateStr = _date.toIso8601String().substring(0, 10);
    _future = ref
        .read(deliveriesRepositoryProvider)
        .listForSeller(date: dateStr, slot: _slot);
    setState(() {});
  }

  Future<void> _mark(Delivery d, DeliveryStatus status, {double? qty}) async {
    try {
      await ref.read(deliveriesRepositoryProvider).mark(
            d.id,
            status: status,
            deliveredQuantity: qty,
          );
      _refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    }
  }

  Future<void> _editQty(Delivery d) async {
    final ctrl = TextEditingController(
      text: (d.deliveredQuantity ?? d.expectedQuantity).toString(),
    );
    final result = await showModalBottomSheet<double?>(
      context: context,
      isScrollControlled: true,
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(
          24,
          24,
          24,
          MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Edit quantity for ${d.customerName}',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              autofocus: true,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Delivered (L)',
                prefixIcon: Icon(Icons.water_drop_outlined),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => Navigator.pop(
                context,
                double.tryParse(ctrl.text),
              ),
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
    if (result != null) {
      final isPartial = result < d.expectedQuantity;
      await _mark(d, isPartial ? DeliveryStatus.partial : DeliveryStatus.delivered,
          qty: result);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Report'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today_outlined),
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _date,
                firstDate: DateTime.now().subtract(const Duration(days: 30)),
                lastDate: DateTime.now().add(const Duration(days: 7)),
              );
              if (picked != null) {
                _date = picked;
                _refresh();
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Generate tomorrow\'s deliveries',
            onPressed: () async {
              await ref.read(deliveriesRepositoryProvider).generateNow();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Generated for tomorrow')),
                );
              }
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                ChoiceChip(
                  label: const Text('Morning'),
                  selected: _slot == DeliverySlot.morning,
                  onSelected: (_) {
                    _slot = DeliverySlot.morning;
                    _refresh();
                  },
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('Evening'),
                  selected: _slot == DeliverySlot.evening,
                  onSelected: (_) {
                    _slot = DeliverySlot.evening;
                    _refresh();
                  },
                ),
                const Spacer(),
                Text(
                  _date.toIso8601String().substring(0, 10),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<Delivery>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snap.hasError) {
            return ErrorView(
              message: 'Failed to load deliveries.\n${snap.error}',
              onRetry: _refresh,
            );
          }
          final rows = snap.data ?? [];
          if (rows.isEmpty) {
            return EmptyState(
              message:
                  'No deliveries for this slot.\nGenerate tomorrow\'s deliveries from the toolbar.',
              icon: Icons.local_shipping_outlined,
            );
          }
          final total = rows.fold<double>(
            0,
            (a, d) => a + d.expectedQuantity,
          );
          final delivered = rows
              .where((d) =>
                  d.status == DeliveryStatus.delivered ||
                  d.status == DeliveryStatus.partial)
              .fold<double>(
                0,
                (a, d) => a + (d.deliveredQuantity ?? d.expectedQuantity),
              );
          final pending =
              rows.where((d) => d.status == DeliveryStatus.pending).length;

          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: rows.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final d = rows[i];
                    return Dismissible(
                      key: ValueKey(d.id),
                      direction: DismissDirection.endToStart,
                      confirmDismiss: (_) async {
                        await _mark(d, DeliveryStatus.missed);
                        return false; // we update in place; don't actually remove
                      },
                      background: Container(
                        alignment: Alignment.centerRight,
                        padding: const EdgeInsets.only(right: 24),
                        color: Colors.red.shade400,
                        child: const Icon(Icons.cancel, color: Colors.white),
                      ),
                      child: _DeliveryTile(
                        d: d,
                        onTap: () => _mark(d, DeliveryStatus.delivered),
                        onLongPress: () => _editQty(d),
                      ),
                    );
                  },
                ),
              ),
              _Footer(
                total: total,
                delivered: delivered,
                pending: pending,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _DeliveryTile extends StatelessWidget {
  const _DeliveryTile({
    required this.d,
    required this.onTap,
    required this.onLongPress,
  });

  final Delivery d;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = switch (d.status) {
      DeliveryStatus.delivered => Colors.green.shade700,
      DeliveryStatus.partial => Colors.orange.shade700,
      DeliveryStatus.missed => Colors.red.shade700,
      DeliveryStatus.pending => theme.colorScheme.outline,
      DeliveryStatus.extra => Colors.blue.shade700,
    };
    final icon = switch (d.status) {
      DeliveryStatus.delivered => Icons.check_circle,
      DeliveryStatus.partial => Icons.water_drop,
      DeliveryStatus.missed => Icons.cancel,
      DeliveryStatus.pending => Icons.radio_button_unchecked,
      DeliveryStatus.extra => Icons.add_circle,
    };
    return Card(
      child: ListTile(
        onTap: onTap,
        onLongPress: onLongPress,
        leading: Icon(icon, color: color, size: 32),
        title: Text(
          d.customerName,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          'Expected: ${d.expectedQuantity} L · ₹${d.unitRate.toStringAsFixed(0)}/L'
          '${d.deliveredQuantity != null ? '\nDelivered: ${d.deliveredQuantity} L' : ''}',
        ),
        isThreeLine: d.deliveredQuantity != null,
        trailing: Text(
          d.status.name,
          style: TextStyle(color: color, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer({required this.total, required this.delivered, required this.pending});

  final double total;
  final double delivered;
  final int pending;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
      ),
      child: Row(
        children: [
          _Stat(label: 'Total', value: '${total.toStringAsFixed(1)} L'),
          _Stat(label: 'Delivered', value: '${delivered.toStringAsFixed(1)} L'),
          _Stat(label: 'Pending', value: '$pending'),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.bodySmall),
          Text(
            value,
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
