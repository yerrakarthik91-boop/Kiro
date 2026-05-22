enum ComplaintCategory { delivery, billing, quantity, other }
enum ComplaintStatus { open, in_progress, resolved, rejected }

class Complaint {
  Complaint({
    required this.id,
    required this.category,
    required this.status,
    required this.createdAt,
    this.description,
    this.resolutionNote,
  });

  final String id;
  final ComplaintCategory category;
  final ComplaintStatus status;
  final DateTime createdAt;
  final String? description;
  final String? resolutionNote;

  factory Complaint.fromJson(Map<String, dynamic> j) => Complaint(
        id: j['id'] as String,
        category: ComplaintCategory.values.firstWhere(
          (e) => e.name == (j['category'] ?? 'other'),
          orElse: () => ComplaintCategory.other,
        ),
        status: ComplaintStatus.values.firstWhere(
          (e) => e.name == (j['status'] ?? 'open'),
          orElse: () => ComplaintStatus.open,
        ),
        createdAt: DateTime.tryParse(j['created_at']?.toString() ?? '') ??
            DateTime.now(),
        description: j['description'] as String?,
        resolutionNote: j['resolution_note'] as String?,
      );
}
