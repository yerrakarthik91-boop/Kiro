import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:printing/printing.dart';

import '../../../data/models/bill.dart';
import '../../../data/repositories/bills_repository.dart';
import '../../../data/repositories/payments_repository.dart';
import '../../../shared/widgets/loading_view.dart';

class BillDetailScreen extends ConsumerStatefulWidget {
  const BillDetailScreen({super.key, required this.billId, required this.role});
  final String billId;
  final String role; // 'seller' or 'buyer'

  @override
  ConsumerState<BillDetailScreen> createState() => _BillDetailScreenState();
}

class _BillDetailScreenState extends ConsumerState<BillDetailScreen> {
  Future<({Bill bill, List<BillItem> items, String customerName, String? customerPhone, String? customerAddress})>? _f;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() {
    final repo = ref.read(billsRepositoryProvider);
    _f = widget.role == 'seller'
        ? repo.detailSeller(widget.billId)
        : repo.detailBuyer(widget.billId);
    setState(() {});
  }

  Future<void> _sharePdf(Bill bill) async {
    try {
      final bytes = await ref.read(billsRepositoryProvider).downloadPdfBytes(
            billId: bill.id,
            role: widget.role,
          );
      if (!mounted) return;
      await Printing.sharePdf(
        bytes: Uint8List.fromList(bytes),
        filename: '${bill.billNumber}.pdf',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not generate PDF: $e')),
        );
      }
    }
  }

  Future<void> _markPaid(Bill bill) async {
    final balance = bill.totalAmount - bill.paidAmount;
    if (balance <= 0) return;
    await ref.read(paymentsRepositoryProvider).recordCash(
          customerId: bill.customerId,
          billId: bill.id,
          amount: balance,
          method: 'cash',
        );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment recorded.')),
      );
    }
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoice'),
        actions: [
          FutureBuilder<
                  ({
                    Bill bill,
                    List<BillItem> items,
                    String customerName,
                    String? customerPhone,
                    String? customerAddress,
                  })>(
              future: _f,
              builder: (_, snap) {
                final bill = snap.data?.bill;
                return IconButton(
                  icon: const Icon(Icons.share_outlined),
                  tooltip: 'Share PDF',
                  onPressed: bill == null ? null : () => _sharePdf(bill),
                );
              }),
        ],
      ),
      body: FutureBuilder<({Bill bill, List<BillItem> items, String customerName, String? customerPhone, String? customerAddress})>(
        future: _f,
        builder: (_, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const LoadingView();
          }
          if (snap.hasError) {
            return ErrorView(message: '${snap.error}', onRetry: _refresh);
          }
          final detail = snap.data!;
          final bill = detail.bill;
          final balance = bill.totalAmount - bill.paidAmount;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(detail.customerName,
                          style: Theme.of(context).textTheme.titleLarge),
                      if (detail.customerPhone != null)
                        Text(detail.customerPhone!),
                      if (detail.customerAddress != null)
                        Text(detail.customerAddress!,
                            style: Theme.of(context).textTheme.bodySmall),
                      const Divider(height: 24),
                      _kv('Invoice #', bill.billNumber),
                      _kv('Period',
                          '${bill.periodStart} → ${bill.periodEnd}'),
                      if (bill.dueDate != null) _kv('Due', bill.dueDate!),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Text('Delivery breakdown',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      Table(
                        columnWidths: const {
                          0: FlexColumnWidth(2),
                          1: FlexColumnWidth(1),
                          2: FlexColumnWidth(1),
                          3: FlexColumnWidth(1),
                        },
                        children: [
                          const TableRow(
                            children: [
                              _Cell('Date', bold: true),
                              _Cell('Slot', bold: true),
                              _Cell('Qty', bold: true),
                              _Cell('Total', bold: true, alignRight: true),
                            ],
                          ),
                          ...detail.items.map(
                            (it) => TableRow(
                              children: [
                                _Cell(it.deliveryDate),
                                _Cell(it.slot.substring(0, 1).toUpperCase()),
                                _Cell('${it.quantity} L'),
                                _Cell('₹${it.lineTotal.toStringAsFixed(0)}',
                                    alignRight: true),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _kv('Total',
                          '₹${bill.totalAmount.toStringAsFixed(2)}'),
                      _kv('Paid',
                          '₹${bill.paidAmount.toStringAsFixed(2)}'),
                      _kv('Balance', '₹${balance.toStringAsFixed(2)}',
                          bold: true),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (widget.role == 'seller' && balance > 0)
                FilledButton.icon(
                  onPressed: () => _markPaid(bill),
                  icon: const Icon(Icons.check_circle_outline),
                  label: Text('Mark paid (₹${balance.toStringAsFixed(0)})'),
                ),
              if (widget.role == 'buyer' && balance > 0)
                FilledButton.icon(
                  onPressed: () async {
                    await ref.read(paymentsRepositoryProvider).payOnlineMock(
                          billId: bill.id,
                          amount: balance,
                        );
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Payment successful (mock)')),
                      );
                    }
                    _refresh();
                  },
                  icon: const Icon(Icons.payments_outlined),
                  label: Text('Pay now (₹${balance.toStringAsFixed(0)})'),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _kv(String k, String v, {bool bold = false}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(k),
            Text(v,
                style: TextStyle(fontWeight: bold ? FontWeight.w700 : FontWeight.w500)),
          ],
        ),
      );
}

class _Cell extends StatelessWidget {
  const _Cell(this.text, {this.bold = false, this.alignRight = false});
  final String text;
  final bool bold;
  final bool alignRight;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Text(
        text,
        textAlign: alignRight ? TextAlign.right : TextAlign.left,
        style: TextStyle(fontWeight: bold ? FontWeight.w700 : FontWeight.normal),
      ),
    );
  }
}
