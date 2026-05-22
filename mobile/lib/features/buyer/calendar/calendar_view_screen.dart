import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/deliveries_repository.dart';
import '../../../shared/widgets/loading_view.dart';

/// BU-03 Calendar View. Color-codes each day per the PRD spec.
class CalendarViewScreen extends ConsumerStatefulWidget {
  const CalendarViewScreen({super.key});

  @override
  ConsumerState<CalendarViewScreen> createState() => _CalendarViewScreenState();
}

class _CalendarViewScreenState extends ConsumerState<CalendarViewScreen> {
  DateTime _month = DateTime(DateTime.now().year, DateTime.now().month);
  Future<Map<String, String>>? _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    final m = '${_month.year}-${_month.month.toString().padLeft(2, '0')}';
    _future = ref.read(deliveriesRepositoryProvider).calendar(m);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: () {
              _month = DateTime(_month.year, _month.month - 1);
              _load();
            },
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () {
              _month = DateTime(_month.year, _month.month + 1);
              _load();
            },
          ),
        ],
      ),
      body: FutureBuilder<Map<String, String>>(
        future: _future,
        builder: (_, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snap.hasError) {
            return ErrorView(message: '${snap.error}', onRetry: _load);
          }
          final map = snap.data ?? {};
          return Column(
            children: [
              const SizedBox(height: 8),
              Text(
                _formatMonth(_month),
                style: theme.textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              const _Legend(),
              const SizedBox(height: 12),
              Expanded(child: _CalendarGrid(month: _month, statuses: map)),
            ],
          );
        },
      ),
    );
  }

  String _formatMonth(DateTime d) {
    const names = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return '${names[d.month - 1]} ${d.year}';
  }
}

class _Legend extends StatelessWidget {
  const _Legend();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 16,
        runSpacing: 8,
        children: [
          _legendDot(AppColors.morningDelivered, 'Morning'),
          _legendDot(AppColors.eveningDelivered, 'Evening'),
          _legendDot(AppColors.bothDelivered, 'Both'),
          _legendDot(AppColors.missedDelivery, 'Missed'),
        ],
      ),
    );
  }

  Widget _legendDot(Color c, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(color: c, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(label),
        ],
      );
}

class _CalendarGrid extends StatelessWidget {
  const _CalendarGrid({required this.month, required this.statuses});
  final DateTime month;
  final Map<String, String> statuses;

  @override
  Widget build(BuildContext context) {
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final firstWeekday = DateTime(month.year, month.month, 1).weekday;
    // Sunday-first: Sunday = 0
    final leading = firstWeekday % 7;

    final cells = <Widget>[
      for (final wd in const ['S', 'M', 'T', 'W', 'T', 'F', 'S'])
        Center(
          child: Text(
            wd,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).colorScheme.outline,
                ),
          ),
        ),
      for (var i = 0; i < leading; i++) const SizedBox(),
      for (var d = 1; d <= daysInMonth; d++)
        _DayCell(
          day: d,
          status: statuses[
              '${month.year}-${month.month.toString().padLeft(2, '0')}-${d.toString().padLeft(2, '0')}'],
        ),
    ];
    return GridView.count(
      crossAxisCount: 7,
      padding: const EdgeInsets.all(8),
      childAspectRatio: 1,
      children: cells,
    );
  }
}

class _DayCell extends StatelessWidget {
  const _DayCell({required this.day, this.status});
  final int day;
  final String? status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'morning' => AppColors.morningDelivered,
      'evening' => AppColors.eveningDelivered,
      'both' => AppColors.bothDelivered,
      'missed' => AppColors.missedDelivery,
      _ => null,
    };
    return Container(
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: color?.withOpacity(0.18),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: color ?? Theme.of(context).colorScheme.outlineVariant,
          width: color == null ? 0.5 : 1.5,
        ),
      ),
      alignment: Alignment.center,
      child: Text(
        '$day',
        style: TextStyle(
          fontWeight: color == null ? FontWeight.normal : FontWeight.w700,
          color: color ?? Theme.of(context).colorScheme.onSurface,
        ),
      ),
    );
  }
}
