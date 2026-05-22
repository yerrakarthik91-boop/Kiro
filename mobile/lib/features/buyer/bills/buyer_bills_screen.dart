import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/app_router.dart';
import '../../../data/models/bill.dart';
import '../../../data/repositories/bills_repository.dart';
import '../../../shared/widgets/loading_view.dart';

class BuyerBillsScreen extends ConsumerStatefulWidget {
  const BuyerBillsScreen({super.key});

  @override
  ConsumerState<BuyerBillsScreen> createState() => _BuyerBillsScreenState();
}

class _BuyerBillsScreenState extends ConsumerState<BuyerBillsScreen> {
  Future<List<Bill>>? _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(billsRepositoryProvider).listForBuyer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My bills')),
      body: FutureBuilder<List<Bill>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snap.hasError) {
            return ErrorView(
              message: '${snap.error}',
              onRetry: () => setState(() {
                _future = ref.read(billsRepositoryProvider).listForBuyer();
              }),
            );
          }
          final rows = snap.data ?? [];
          if (rows.isEmpty) {
            return const EmptyState(
              message: 'No bills yet.',
              icon: Icons.receipt_long_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () async => setState(() {
              _future = ref.read(billsRepositoryProvider).listForBuyer();
            }),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: rows.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) {
                final b = rows[i];
                final color = switch (b.status) {
                  BillStatus.paid => Colors.green.shade700,
                  BillStatus.partial => Colors.orange.shade700,
                  BillStatus.overdue => Colors.red.shade700,
                  _ => Theme.of(context).colorScheme.outline,
                };
                return Card(
                  child: ListTile(
                    onTap: () =>
                        context.push('${Routes.buyerBillDetail}?id=${b.id}'),
                    title: Text('₹${b.totalAmount.toStringAsFixed(0)}',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      'Period ${b.periodStart} → ${b.periodEnd}'
                      '${b.dueDate != null ? '\nDue ${b.dueDate}' : ''}',
                    ),
                    isThreeLine: b.dueDate != null,
                    trailing: Text(b.status.name,
                        style: TextStyle(color: color, fontWeight: FontWeight.w600)),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
