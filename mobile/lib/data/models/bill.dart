enum BillStatus { draft, pending, partial, paid, overdue, voidStatus }

class Bill {
  Bill({
    required this.id,
    required this.billNumber,
    required this.customerId,
    required this.customerName,
    required this.periodStart,
    required this.periodEnd,
    required this.totalAmount,
    required this.paidAmount,
    required this.balance,
    required this.status,
    this.dueDate,
  });

  final String id;
  final String billNumber;
  final String customerId;
  final String customerName;
  final String periodStart;
  final String periodEnd;
  final double totalAmount;
  final double paidAmount;
  final double balance;
  final String? dueDate;
  final BillStatus status;

  factory Bill.fromJson(Map<String, dynamic> j) => Bill(
        id: j['id'] as String,
        billNumber: j['bill_number'] as String,
        customerId: j['customer_id'] as String,
        customerName: (j['customer_name'] ?? 'Bill') as String,
        periodStart: j['period_start'] as String,
        periodEnd: j['period_end'] as String,
        totalAmount: _d(j['total_amount']),
        paidAmount: _d(j['paid_amount']),
        balance: _d(j['balance'] ?? (_d(j['total_amount']) - _d(j['paid_amount']))),
        dueDate: j['due_date'] as String?,
        status: _statusFromString(j['status'] as String?),
      );
}

class BillItem {
  BillItem({
    required this.deliveryDate,
    required this.slot,
    required this.quantity,
    required this.unitRate,
    required this.lineTotal,
  });

  final String deliveryDate;
  final String slot;
  final double quantity;
  final double unitRate;
  final double lineTotal;

  factory BillItem.fromJson(Map<String, dynamic> j) => BillItem(
        deliveryDate: j['delivery_date'] as String,
        slot: j['slot'] as String,
        quantity: _d(j['quantity']),
        unitRate: _d(j['unit_rate']),
        lineTotal: _d(j['line_total']),
      );
}

double _d(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v) ?? 0.0;
  return 0.0;
}

BillStatus _statusFromString(String? s) {
  switch (s) {
    case 'paid':
      return BillStatus.paid;
    case 'partial':
      return BillStatus.partial;
    case 'overdue':
      return BillStatus.overdue;
    case 'void':
      return BillStatus.voidStatus;
    case 'draft':
      return BillStatus.draft;
    default:
      return BillStatus.pending;
  }
}
