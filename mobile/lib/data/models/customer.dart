enum DeliveryType { morning, evening, both }
enum CustomerStatus { active, paused, due_payment, archived }

class Customer {
  Customer({
    required this.id,
    required this.name,
    required this.phone,
    required this.deliveryType,
    required this.morningQuantity,
    required this.eveningQuantity,
    required this.status,
    this.altPhone,
    this.address,
    this.milkRate,
    this.billingStartDate,
  });

  final String id;
  final String name;
  final String phone;
  final String? altPhone;
  final String? address;
  final DeliveryType deliveryType;
  final double morningQuantity;
  final double eveningQuantity;
  final double? milkRate;
  final String? billingStartDate;
  final CustomerStatus status;

  factory Customer.fromJson(Map<String, dynamic> j) => Customer(
        id: j['id'] as String,
        name: j['name'] as String,
        phone: j['phone'] as String,
        altPhone: j['alt_phone'] as String?,
        address: j['address'] as String?,
        deliveryType: DeliveryType.values.firstWhere(
          (e) => e.name == (j['delivery_type'] ?? 'morning'),
          orElse: () => DeliveryType.morning,
        ),
        morningQuantity: _toDouble(j['morning_quantity']),
        eveningQuantity: _toDouble(j['evening_quantity']),
        milkRate: j['milk_rate'] == null ? null : _toDouble(j['milk_rate']),
        billingStartDate: j['billing_start_date'] as String?,
        status: CustomerStatus.values.firstWhere(
          (e) => e.name == (j['status'] ?? 'active'),
          orElse: () => CustomerStatus.active,
        ),
      );

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        'phone': phone,
        if (altPhone != null) 'alt_phone': altPhone,
        if (address != null) 'address': address,
        'delivery_type': deliveryType.name,
        'morning_quantity': morningQuantity,
        'evening_quantity': eveningQuantity,
        if (milkRate != null) 'milk_rate': milkRate,
        if (billingStartDate != null) 'billing_start_date': billingStartDate,
      };
}

double _toDouble(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v) ?? 0.0;
  return 0.0;
}
