enum DeliverySlot { morning, evening }
enum DeliveryStatus { pending, delivered, missed, partial, extra }

class Delivery {
  Delivery({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.deliveryDate,
    required this.slot,
    required this.expectedQuantity,
    required this.unitRate,
    required this.status,
    this.deliveredQuantity,
    this.notes,
  });

  final String id;
  final String customerId;
  final String customerName;
  final String deliveryDate;
  final DeliverySlot slot;
  final double expectedQuantity;
  final double? deliveredQuantity;
  final double unitRate;
  final DeliveryStatus status;
  final String? notes;

  factory Delivery.fromJson(Map<String, dynamic> j) => Delivery(
        id: j['id'] as String,
        customerId: j['customer_id'] as String,
        customerName: (j['customer_name'] ?? '?') as String,
        deliveryDate: j['delivery_date'] as String,
        slot: DeliverySlot.values.firstWhere((e) => e.name == j['slot']),
        expectedQuantity: _d(j['expected_quantity']),
        deliveredQuantity:
            j['delivered_quantity'] == null ? null : _d(j['delivered_quantity']),
        unitRate: _d(j['unit_rate']),
        status: DeliveryStatus.values.firstWhere(
          (e) => e.name == j['status'],
          orElse: () => DeliveryStatus.pending,
        ),
        notes: j['notes'] as String?,
      );
}

double _d(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v) ?? 0.0;
  return 0.0;
}
