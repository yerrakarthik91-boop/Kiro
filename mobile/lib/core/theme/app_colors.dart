import 'package:flutter/material.dart';

/// Brand color tokens. Mirrors values in docs/06-Mobile-App-Screens.md §0.
class AppColors {
  AppColors._();

  // Brand
  static const milkGreen = Color(0xFF0A8754);
  static const milkGreenLight = Color(0xFF7BD9A2);
  static const accentOrange = Color(0xFFF4A261);

  // Calendar (BU-03)
  static const morningDelivered = Color(0xFFFFC107); // yellow
  static const eveningDelivered = Color(0xFF1976D2); // blue
  static const bothDelivered = Color(0xFF2E7D32); // green
  static const missedDelivery = Color(0xFFC62828); // red
}
