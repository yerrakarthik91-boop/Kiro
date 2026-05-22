import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_localizations.dart';
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
        SnackBar(content: Text(AppLocalizations.of(context).t('complaint_submitted'))),
      );
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppLocalizations.of(context).t('failed')}: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.t('raise_complaint'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(l10n.t('complaint_category')),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final c in ComplaintCategory.values)
                ChoiceChip(
                  label: Text(_categoryLabel(l10n, c)),
                  selected: _category == c,
                  onSelected: (_) => setState(() => _category = c),
                ),
            ],
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _desc,
            decoration: InputDecoration(
              labelText: l10n.t('description_optional'),
              border: const OutlineInputBorder(),
            ),
            maxLines: 4,
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            label: l10n.t('submit'),
            loading: _saving,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }

  String _categoryLabel(AppLocalizations l10n, ComplaintCategory c) {
    switch (c) {
      case ComplaintCategory.delivery:
        return l10n.t('category_delivery');
      case ComplaintCategory.billing:
        return l10n.t('category_billing');
      case ComplaintCategory.quantity:
        return l10n.t('category_quantity');
      case ComplaintCategory.other:
        return l10n.t('category_other');
    }
  }
}
