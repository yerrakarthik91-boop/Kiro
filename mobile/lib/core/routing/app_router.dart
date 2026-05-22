import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/login_screen.dart';
import '../../features/auth/otp_verify_screen.dart';
import '../../features/buyer/buyer_dashboard_screen.dart';
import '../../features/seller/seller_dashboard_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/user_selection/user_selection_screen.dart';

/// Centralized route paths so screens reference them by name.
abstract class Routes {
  static const splash = '/';
  static const userSelection = '/select-role';
  static const login = '/login';
  static const otpVerify = '/otp';
  static const sellerHome = '/seller';
  static const buyerHome = '/buyer';
}

final appRouterProvider = Provider<GoRouter>((_) {
  return GoRouter(
    initialLocation: Routes.splash,
    debugLogDiagnostics: false,
    routes: [
      GoRoute(
        path: Routes.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: Routes.userSelection,
        builder: (_, __) => const UserSelectionScreen(),
      ),
      GoRoute(
        path: Routes.login,
        builder: (_, state) => LoginScreen(
          role: state.uri.queryParameters['role'] ?? 'buyer',
        ),
      ),
      GoRoute(
        path: Routes.otpVerify,
        builder: (_, state) => OtpVerifyScreen(
          phone: state.uri.queryParameters['phone'] ?? '',
          role: state.uri.queryParameters['role'] ?? 'buyer',
        ),
      ),
      GoRoute(
        path: Routes.sellerHome,
        builder: (_, __) => const SellerDashboardScreen(),
      ),
      GoRoute(
        path: Routes.buyerHome,
        builder: (_, __) => const BuyerDashboardScreen(),
      ),
    ],
  );
});
