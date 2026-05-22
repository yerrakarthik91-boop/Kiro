import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/routing/app_router.dart';
import '../../core/storage/secure_storage.dart';
import '../../shared/widgets/app_logo.dart';

/// SCR-01 Splash. Checks session and routes accordingly.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    // Brief brand moment.
    await Future.delayed(const Duration(milliseconds: 800));

    final storage = ref.read(secureStorageProvider);
    final token = await storage.getAccessToken();
    final role = await storage.getRole();

    if (!mounted) return;

    if (token != null && role == 'seller') {
      context.go(Routes.sellerHome);
    } else if (token != null && role == 'buyer') {
      context.go(Routes.buyerHome);
    } else {
      context.go(Routes.userSelection);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AppLogo(size: 120),
            const SizedBox(height: 24),
            Text(
              'Milk Management System',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 32),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(strokeWidth: 2.5),
            ),
          ],
        ),
      ),
    );
  }
}
