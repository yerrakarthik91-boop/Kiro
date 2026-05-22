import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/login_screen.dart';
import '../../features/auth/otp_verify_screen.dart';
import '../../features/buyer/bills/buyer_bills_screen.dart';
import '../../features/buyer/buyer_dashboard_screen.dart';
import '../../features/buyer/calendar/calendar_view_screen.dart';
import '../../features/buyer/complaints/complaint_create_screen.dart';
import '../../features/seller/bills/bill_detail_screen.dart';
import '../../features/seller/bills/bills_list_screen.dart';
import '../../features/seller/customers/customer_form_screen.dart';
import '../../features/seller/customers/customer_list_screen.dart';
import '../../features/seller/deliveries/delivery_report_screen.dart';
import '../../features/seller/seller_dashboard_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/user_selection/user_selection_screen.dart';

abstract class Routes {
  static const splash = '/';
  static const userSelection = '/select-role';
  static const login = '/login';
  static const otpVerify = '/otp';

  // Seller
  static const sellerHome = '/seller';
  static const customers = '/seller/customers';
  static const customerForm = '/seller/customers/form';
  static const deliveryReport = '/seller/deliveries';
  static const bills = '/seller/bills';
  static const billDetail = '/seller/bills/detail';

  // Buyer
  static const buyerHome = '/buyer';
  static const buyerBills = '/buyer/bills';
  static const buyerBillDetail = '/buyer/bills/detail';
  static const calendar = '/buyer/calendar';
  static const complaintCreate = '/buyer/complaint/new';
}

final appRouterProvider = Provider<GoRouter>((_) {
  return GoRouter(
    initialLocation: Routes.splash,
    debugLogDiagnostics: false,
    routes: [
      GoRoute(path: Routes.splash, builder: (_, __) => const SplashScreen()),
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

      // Seller flows
      GoRoute(
        path: Routes.sellerHome,
        builder: (_, __) => const SellerDashboardScreen(),
      ),
      GoRoute(
        path: Routes.customers,
        builder: (_, __) => const CustomerListScreen(),
      ),
      GoRoute(
        path: Routes.customerForm,
        builder: (_, state) => CustomerFormScreen(
          customerId: state.uri.queryParameters['id'],
        ),
      ),
      GoRoute(
        path: Routes.deliveryReport,
        builder: (_, __) => const DeliveryReportScreen(),
      ),
      GoRoute(
        path: Routes.bills,
        builder: (_, __) => const BillsListScreen(),
      ),
      GoRoute(
        path: Routes.billDetail,
        builder: (_, state) => BillDetailScreen(
          billId: state.uri.queryParameters['id']!,
          role: 'seller',
        ),
      ),

      // Buyer flows
      GoRoute(
        path: Routes.buyerHome,
        builder: (_, __) => const BuyerDashboardScreen(),
      ),
      GoRoute(
        path: Routes.buyerBills,
        builder: (_, __) => const BuyerBillsScreen(),
      ),
      GoRoute(
        path: Routes.buyerBillDetail,
        builder: (_, state) => BillDetailScreen(
          billId: state.uri.queryParameters['id']!,
          role: 'buyer',
        ),
      ),
      GoRoute(
        path: Routes.calendar,
        builder: (_, __) => const CalendarViewScreen(),
      ),
      GoRoute(
        path: Routes.complaintCreate,
        builder: (_, __) => const ComplaintCreateScreen(),
      ),
    ],
  );
});
