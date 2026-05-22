import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/repositories/reports_repository.dart';
import '../../../shared/widgets/loading_view.dart';

/// SE-13 Profit & Loss + Daily / Monthly reports.
class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Daily'),
            Tab(text: 'Monthly'),
            Tab(text: 'Profit & Loss'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [
          _DailyTab(),
          _MonthlyTab(),
          _PnlTab(),
        ],
      ),
    );
  }
}

class _DailyTab extends ConsumerStatefulWidget {
  const _DailyTab();
  @override
  ConsumerState<_DailyTab> createState() => _DailyTabState();
}

class _DailyTabState extends ConsumerState<_DailyTab> {
  DateTime _date = DateTime.now();
  Future<DailyReport>? _f;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _f = ref.read(reportsRepositoryProvider).daily(
          date: _date.toIso8601String().substring(0, 10),
        );
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<DailyReport>(
      future: _f,
      builder: (_, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const LoadingView();
        }
        if (snap.hasError) {
          return ErrorView(message: '${snap.error}', onRetry: _load);
        }
        final r = snap.data!;
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(r.date,
                      style: Theme.of(context).textTheme.titleLarge),
                ),
                IconButton(
                  icon: const Icon(Icons.calendar_month),
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _date,
                      firstDate: DateTime.now()
                          .subtract(const Duration(days: 365)),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      _date = picked;
                      _load();
                    }
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            _Stat(label: 'Total milk', value: '${r.totalMilk.toStringAsFixed(1)} L'),
            _Stat(label: 'Morning', value: '${r.morning.toStringAsFixed(1)} L'),
            _Stat(label: 'Evening', value: '${r.evening.toStringAsFixed(1)} L'),
            _Stat(label: 'Revenue', value: '₹${r.revenue.toStringAsFixed(0)}'),
            _Stat(label: 'Delivered', value: '${r.deliveredCount}'),
            _Stat(label: 'Missed', value: '${r.missedCount}', isAlert: r.missedCount > 0),
          ],
        );
      },
    );
  }
}

class _MonthlyTab extends ConsumerStatefulWidget {
  const _MonthlyTab();
  @override
  ConsumerState<_MonthlyTab> createState() => _MonthlyTabState();
}

class _MonthlyTabState extends ConsumerState<_MonthlyTab> {
  Future<MonthlyReport>? _f;

  @override
  void initState() {
    super.initState();
    _f = ref.read(reportsRepositoryProvider).monthly();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<MonthlyReport>(
      future: _f,
      builder: (_, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const LoadingView();
        }
        if (snap.hasError) {
          return ErrorView(
            message: '${snap.error}',
            onRetry: () => setState(() {
              _f = ref.read(reportsRepositoryProvider).monthly();
            }),
          );
        }
        final r = snap.data!;
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(r.month, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            _Stat(label: 'Total milk', value: '${r.totalMilk.toStringAsFixed(1)} L'),
            _Stat(
              label: 'Revenue (deliveries)',
              value: '₹${r.revenueFromDeliveries.toStringAsFixed(0)}',
            ),
            _Stat(label: 'Billed', value: '₹${r.billed.toStringAsFixed(0)}'),
            _Stat(label: 'Collected', value: '₹${r.collected.toStringAsFixed(0)}'),
            _Stat(
              label: 'Pending',
              value: '₹${r.pending.toStringAsFixed(0)}',
              isAlert: r.pending > 0,
            ),
            _Stat(
              label: 'Missed deliveries',
              value: '${r.missedDeliveries}',
              isAlert: r.missedDeliveries > 0,
            ),
          ],
        );
      },
    );
  }
}

class _PnlTab extends ConsumerStatefulWidget {
  const _PnlTab();
  @override
  ConsumerState<_PnlTab> createState() => _PnlTabState();
}

class _PnlTabState extends ConsumerState<_PnlTab> {
  String _range = 'month';
  Future<PnlReport>? _f;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _f = ref.read(reportsRepositoryProvider).profitLoss(range: _range);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PnlReport>(
      future: _f,
      builder: (_, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const LoadingView();
        }
        if (snap.hasError) {
          return ErrorView(message: '${snap.error}', onRetry: _load);
        }
        final r = snap.data!;
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'day', label: Text('Day')),
                  ButtonSegment(value: 'week', label: Text('Week')),
                  ButtonSegment(value: 'month', label: Text('Month')),
                ],
                selected: {_range},
                onSelectionChanged: (s) {
                  _range = s.first;
                  _load();
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: _SmallStat(label: 'Milk', value: '${r.totalMilk.toStringAsFixed(0)} L'),
                  ),
                  Expanded(
                    child: _SmallStat(
                      label: 'Revenue',
                      value: '₹${r.totalRevenue.toStringAsFixed(0)}',
                    ),
                  ),
                  Expanded(
                    child: _SmallStat(
                      label: 'Profit',
                      value: '₹${r.totalProfit.toStringAsFixed(0)}',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (r.series.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: SizedBox(
                  height: 180,
                  child: CustomPaint(
                    painter: _BarsPainter(
                      values: r.series.map((b) => b.revenue).toList(),
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    child: const SizedBox.expand(),
                  ),
                ),
              ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: r.series.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final b = r.series[i];
                  return Card(
                    child: ListTile(
                      title: Text(b.bucket),
                      subtitle: Text('${b.milk.toStringAsFixed(1)} L'),
                      trailing: Text('₹${b.revenue.toStringAsFixed(0)}',
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 16)),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, this.isAlert = false});
  final String label;
  final String value;
  final bool isAlert;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: isAlert ? Colors.red.shade700 : null,
          ),
        ),
      ),
    );
  }
}

class _SmallStat extends StatelessWidget {
  const _SmallStat({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: theme.textTheme.bodySmall),
            const SizedBox(height: 4),
            Text(
              value,
              style: theme.textTheme.titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}

class _BarsPainter extends CustomPainter {
  _BarsPainter({required this.values, required this.color});
  final List<double> values;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;
    final maxV = values.reduce((a, b) => a > b ? a : b);
    if (maxV <= 0) return;
    final paint = Paint()..color = color;
    final barW = size.width / (values.length * 1.5);
    final gap = barW / 2;
    for (var i = 0; i < values.length; i++) {
      final h = (values[i] / maxV) * (size.height - 16);
      final x = i * (barW + gap);
      final rect = Rect.fromLTWH(x, size.height - h, barW, h);
      canvas.drawRRect(
        RRect.fromRectAndRadius(rect, const Radius.circular(4)),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_BarsPainter old) =>
      old.values != values || old.color != color;
}
