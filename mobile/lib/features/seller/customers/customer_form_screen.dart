import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
    final isEdit = widget.customerId != null;
    return Scaffold(
      appBar: AppBar(title: Text(isEdit ? 'Edit Customer' : 'Add Customer')),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _SectionHeader('Basic info'),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Customer name'),
              validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phone,
              decoration: const InputDecoration(labelText: 'Mobile number'),
              keyboardType: TextInputType.phone,
              validator: (v) =>
                  (v?.length ?? 0) < 8 ? 'Enter valid number' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _altPhone,
              decoration: const InputDecoration(labelText: 'Alternate number (optional)'),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _address,
              decoration: const InputDecoration(labelText: 'Address'),
              maxLines: 2,
            ),
            const SizedBox(height: 24),
            _SectionHeader('Delivery settings'),
            SegmentedButton<DeliveryType>(
              segments: const [
                ButtonSegment(value: DeliveryType.morning, label: Text('Morning')),
                ButtonSegment(value: DeliveryType.evening, label: Text('Evening')),
                ButtonSegment(value: DeliveryType.both, label: Text('Both')),
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
                    decoration: const InputDecoration(
                      labelText: 'Morning qty (L)',
                    ),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _evening,
                    decoration: const InputDecoration(
                      labelText: 'Evening qty (L)',
                    ),
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _SectionHeader('Pricing'),
            TextFormField(
              controller: _rate,
              decoration: const InputDecoration(
                labelText: 'Milk rate (₹/L)',
                prefixText: '₹ ',
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 32),
            PrimaryButton(
              label: isEdit ? 'Save changes' : 'Add customer',
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
