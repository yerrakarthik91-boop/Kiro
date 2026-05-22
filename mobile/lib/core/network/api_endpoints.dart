/// Path constants for the MMS REST API. Mirrors docs/05-API-Requirements.md.
class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const otpRequest = '/auth/otp/request';
  static const otpVerify = '/auth/otp/verify';
  static const refresh = '/auth/refresh';
  static const me = '/me';

  // Seller
  static const sellerDashboard = '/seller/dashboard';
  static const sellerCustomers = '/seller/customers';
  static const sellerDeliveries = '/seller/deliveries';
  static const sellerBills = '/seller/bills';

  // Buyer
  static const buyerDashboard = '/buyer/dashboard';
  static const buyerDeliveries = '/buyer/deliveries';
  static const buyerBills = '/buyer/bills';
}
