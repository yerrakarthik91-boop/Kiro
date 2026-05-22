import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/repositories/schedule_repository.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/primary_button.dart';

/// BU-09 Manage Schedule. Pause / Resume / Vacation / Extra request.
class ScheduleManagementScreen extends ConsumerStatefulWidget {
  const ScheduleManagementScreen({super.key});

  @override
  ConsumerState<ScheduleManagementScreen> createState() =>
      _ScheduleManagementScreenState();
}

class _ScheduleManagementScreenState
    extends ConsumerState<ScheduleManagementScreen> {
  Future<({bool active, String? until, String? type})>? _status;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() {
    _status = ref.read(scheduleRepositoryProvider).status();
    setState(() {});
  }

  Future<DateTimeRange?> _pickRange(BuildContext ctx) {
    return showDateRangePicker(
      context: ctx,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      initialDateRange: DateTimeRange(
        start: DateTime.now(),
        end: DateTime.now().add(const Duration(days: 7)),
      ),
    );
  }

  Future<void> _pause({required bool isVacation}) async {
    final range = await _pickRange(context);
    if (range == null) return;
    try {
      final repo = ref.read(scheduleRepositoryProvider);
      if (isVacation) {
        await repo.vacation(from: range.start, to: range.end);
      } else {
        await repo.pause(from: range.start, to: range.end);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(isVacation ? 'Vacation set' : 'Delivery paused'),
        ));
      }
      _refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    }
  }

  Future<void> _resume() async {
    try {
      await ref.read(scheduleRepositoryProvider).resume();
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Delivery resumed')));
      }
      _refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    }
  }

  Future<void> _extraRequest() async {
    final result = await showModalBottomSheet<_ExtraResult?>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _ExtraRequestSheet(),
    );
    if (result == null) return;
    try {
      await ref.read(scheduleRepositoryProvider).extraRequest(
            date: result.date,
            slot: result.slot,
            quantity: result.quantity,
          );
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Extra milk requested')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage schedule')),
      body: FutureBuilder<({bool active, String? until, String? type})>(
        future: _status,
        builder: (_, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          final s = snap.data;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (s != null && s.active)
                Card(
                  color: Colors.orange.shade50,
                  child: ListTile(
                    leading: const Icon(Icons.pause_circle_outline,
                        color: Colors.orange),
                    title: Text(
                      s.type == 'vacation'
                          ? 'You are on vacation'
                          : 'Delivery paused',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text('Until ${s.until ?? '-'}'),
                  ),
                ),
              const SizedBox(height: 12),
              _ActionTile(
                icon: Icons.pause_circle_outline,
                title: 'Pause delivery',
                subtitle: 'Temporarily stop daily delivery',
                onTap: () => _pause(isVacation: false),
              ),
              _ActionTile(
                icon: Icons.beach_access_outlined,
                title: 'Vacation mode',
                subtitle: 'Stop delivery for a longer trip',
                onTap: () => _pause(isVacation: true),
              ),
              _ActionTile(
                icon: Icons.play_circle_outline,
                title: 'Resume delivery',
                subtitle: 'Restart paused delivery now',
                onTap: _resume,
              ),
              _ActionTile(
                icon: Icons.add_circle_outline,
                title: 'Extra milk request',
                subtitle: 'Order extra for a single date',
                onTap: _extraRequest,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

class _ExtraResult {
  _ExtraResult({required this.date, required this.slot, required this.quantity});
  final DateTime date;
  final String slot;
  final double quantity;
}

class _ExtraRequestSheet extends StatefulWidget {
  const _ExtraRequestSheet();

  @override
  State<_ExtraRequestSheet> createState() => _ExtraRequestSheetState();
}

class _ExtraRequestSheetState extends State<_ExtraRequestSheet> {
  DateTime _date = DateTime.now().add(const Duration(days: 1));
  String _slot = 'morning';
  final _qty = TextEditingController(text: '1.0');

  @override
  void dispose() {
    _qty.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
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
          Text('Extra milk request',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.calendar_today_outlined),
            title: Text('Date: ${_date.toIso8601String().substring(0, 10)}'),
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _date,
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 30)),
              );
              if (picked != null) setState(() => _date = picked);
            },
          ),
          const SizedBox(height: 8),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'morning', label: Text('Morning')),
              ButtonSegment(value: 'evening', label: Text('Evening')),
            ],
            selected: {_slot},
            onSelectionChanged: (s) => setState(() => _slot = s.first),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _qty,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Extra quantity (L)',
              prefixIcon: Icon(Icons.water_drop_outlined),
            ),
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            label: 'Submit',
            onPressed: () {
              final q = double.tryParse(_qty.text) ?? 0;
              if (q <= 0) return;
              Navigator.pop(
                context,
                _ExtraResult(date: _date, slot: _slot, quantity: q),
              );
            },
          ),
        ],
      ),
    );
  }
}
