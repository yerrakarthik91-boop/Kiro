import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Simple stand-in logo. Replace with the real brand mark when available.
class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.size = 96});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.milkGreen,
        borderRadius: BorderRadius.circular(size * 0.25),
      ),
      alignment: Alignment.center,
      child: Icon(
        Icons.local_drink_outlined,
        color: Colors.white,
        size: size * 0.55,
      ),
    );
  }
}
