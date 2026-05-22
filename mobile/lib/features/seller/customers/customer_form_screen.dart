import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/i18n/app_localizations.dart';
import '../../../data/models/customer.dart';
import '../../../data/repositories/customers_repository.dart';
import '../../../shared/widgets/primary_button.dart';

/// SE-08 Add / Edit Customer.
class CustomerFormScreen extends ConsumerStatefulWidget {
  const CustomerFormScreen({super.key, this.customerId});
  final String? customerId;

  @override
  ConsumerState<CustomerFormScreen> createState() => _CustomerFormScreenState();
}

class _CustomerFormScreenState extends ConsumerState<CustomerFormScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _altPhone = TextEditingController();
  final _address = TextEditingController();
  final _morning = TextEditingController(text: '1.0');
  final _evening = TextEditingController(text: '0.0');
  final _rate = TextEditingController(text: '60');
  DeliveryType _type = DeliveryType.morning;
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _altPhone.dispose();
    _address.dispose();
    _morning.dispose();
    _evening.dispose();
    _rate.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final dto = {
        'name': _name.text.trim(),
        'phone': _phone.text.trim(),
        if (_altPhone.text.trim().isNotEmpty) 'alt_phone': _altPhone.text.trim(),
        if (_address.text.trim().isNotEmpty) 'address': _address.text.trim(),
        'delivery_type': _type.name,
        'morning_quantity': double.tryParse(_morning.text) ?? 0,
        'evening_quantity': double.tryParse(_evening.text) ?? 0,
        'milk_rate': double.tryParse(_rate.text),
      };
      final repo = ref.read(customersRepositoryProvider);
      if (widget.customerId == null) {
        await repo.create(dto);
      } else {
        await repo.update(widget.customerId!, dto);
      }
      if (!mounted) return;
      ref.invalidate(customersListProvider);
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Save failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isEdit = widget.customerId != null;
    return Scaffold(
      appBar: AppBar(title: Text(isEdit ? l10n.t('edit_customer') : l10n.t('add_customer'))),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _SectionHeader(l10n.t('basic_info')),
            TextFormField(
              controller: _name,
              decoration: InputDecoration(labelText: l10n.t('customer_name')),
              validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phone,
              decoration: InputDecoration(labelText: l10n.t('mobile_number')),
              keyboardType: TextInputType.phone,
              validator: (v) =>
                  (v?.length ?? 0) < 8 ? 'Enter valid number' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _altPhone,
              decoration: InputDecoration(labelText: l10n.t('alt_number')),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _address,
              decoration: InputDecoration(labelText: l10n.t('address')),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            _SectionHeader(l10n.t('delivery_settings')),
            SegmentedButton<DeliveryType>(
              segments: [
                ButtonSegment(value: DeliveryType.morning, label: Text(l10n.t('morning'))),
                ButtonSegment(value: DeliveryType.evening, label: Text(l10n.t('evening'))),
                ButtonSegment(value: DeliveryType.both, label: Text(l10n.t('both'))),
              ],
              selected: {_type},
              onSelectionChanged: (s) => setState(() => _type = s.first),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _morning,
                    decoration: InputDecoration(
                      labelText: l10n.t('morning_qty_label'),
                    ),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _evening,
                    decoration: InputDecoration(
                      labelText: l10n.t('evening_qty_label'),
                    ),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _SectionHeader(l10n.t('pricing')),
            TextFormField(
              controller: _rate,
              decoration: InputDecoration(
                labelText: l10n.t('milk_rate_label'),
                prefixText: '₹ ',
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 32),
            PrimaryButton(
              label: isEdit ? l10n.t('save') : l10n.t('add_customer'),
              loading: _saving,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        text.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.w700,
              letterSpacing: 1.1,
              color: Theme.of(context).colorScheme.outline,
            ),
      ),
    );
  }
}
