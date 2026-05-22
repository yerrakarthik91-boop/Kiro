import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../data/models/complaint.dart';
import '../../../data/repositories/complaints_repository.dart';
import '../../../shared/widgets/primary_button.dart';

class ComplaintCreateScreen extends ConsumerStatefulWidget {
  const ComplaintCreateScreen({super.key});

  @override
  ConsumerState<ComplaintCreateScreen> createState() =>
      _ComplaintCreateScreenState();
}

class _ComplaintCreateScreenState extends ConsumerState<ComplaintCreateScreen> {
  ComplaintCategory _category = ComplaintCategory.delivery;
  final _desc = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _desc.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _saving = true);
    try {
      await ref.read(complaintsRepositoryProvider).createForBuyer(
            category: _category,
            description: _desc.text.trim().isEmpty ? null : _desc.text.trim(),
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Complaint submitted.')),
      );
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Raise complaint')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Category'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final c in ComplaintCategory.values)
                ChoiceChip(
                  label: Text(c.name),
                  selected: _category == c,
                  onSelected: (_) => setState(() => _category = c),
                ),
            ],
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _desc,
            decoration: const InputDecoration(
              labelText: 'Description (optional)',
              border: OutlineInputBorder(),
            ),
            maxLines: 4,
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            label: 'Submit',
            loading: _saving,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
