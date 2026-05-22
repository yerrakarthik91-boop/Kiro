import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/app_router.dart';
import '../../../data/models/bill.dart';
import '../../../data/repositories/bills_repository.dart';
import '../../../shared/widgets/loading_view.dart';

class BillsListScreen extends ConsumerStatefulWidget {
  const BillsListScreen({super.key});

  @override
  ConsumerState<BillsListScreen> createState() => _BillsListScreenState();
}

class _BillsListScreenState extends ConsumerState<BillsListScreen> {
  String _filter = 'all';
  Future<List<Bill>>? _future;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() {
    _future = ref
        .read(billsRepositoryProvider)
        .listForSeller(status: _filter == 'all' ? null : _filter);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Billing'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            tooltip: 'Generate bills now',
            onPressed: () async {
              await ref.read(billsRepositoryProvider).generateNow();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Bills generated.')),
                );
              }
              _refresh();
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                for (final f in const [
                  ['all', 'All'],
                  ['pending', 'Pending'],
                  ['paid', 'Paid'],
                  ['overdue', 'Overdue'],
                ])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(f[1]),
                      selected: _filter == f[0],
                      onSelected: (_) {
                        _filter = f[0];
                        _refresh();
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<Bill>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snap.hasError) {
            return ErrorView(message: '${snap.error}', onRetry: _refresh);
          }
          final rows = snap.data ?? [];
          if (rows.isEmpty) {
            return const EmptyState(
              message: 'No bills yet.\nUse the toolbar to generate bills for last month.',
              icon: Icons.receipt_long_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: rows.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _BillTile(rows[i]),
            ),
          );
        },
      ),
    );
  }
}

class _BillTile extends StatelessWidget {
  const _BillTile(this.b);
  final Bill b;

  @override
  Widget build(BuildContext context) {
    final color = switch (b.status) {
      BillStatus.paid => Colors.green.shade700,
      BillStatus.partial => Colors.orange.shade700,
      BillStatus.overdue => Colors.red.shade700,
      _ => Theme.of(context).colorScheme.outline,
    };
    return Card(
      child: ListTile(
        onTap: () => context.push('${Routes.billDetail}?id=${b.id}'),
        title: Text(b.customerName,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          '${b.billNumber}\n${b.periodStart} → ${b.periodEnd}',
        ),
        isThreeLine: true,
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '₹${b.totalAmount.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(b.status.name,
                style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
