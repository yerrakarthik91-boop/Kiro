import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/i18n/app_localizations.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';
import '../../core/routing/app_router.dart';
import '../../core/storage/secure_storage.dart';
import '../../shared/widgets/primary_button.dart';

/// SCR-04 OTP Verify. On success persists tokens + role and routes to dashboard.
class OtpVerifyScreen extends ConsumerStatefulWidget {
  const OtpVerifyScreen({super.key, required this.phone, required this.role});

  final String phone;
  final String role;

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  final _otpCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  int _resendSeconds = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  void _startResendTimer() {
    _timer?.cancel();
    setState(() => _resendSeconds = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() {
        if (_resendSeconds <= 1) {
          t.cancel();
          _resendSeconds = 0;
        } else {
          _resendSeconds--;
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final otp = _otpCtrl.text.trim();
    if (otp.length < 4) {
      setState(() => _error = 'Enter the OTP');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final api = ref.read(apiClientProvider);
      final res = await api.post(
        ApiEndpoints.otpVerify,
        data: {
          'phone': widget.phone,
          'otp': otp,
          'role': widget.role,
        },
      );
      final body = (res.data as Map<String, dynamic>);
      final data = (body['data'] as Map<String, dynamic>);
      final access = data['access'] as String;
      final refresh = data['refresh'] as String;
      final user = data['user'] as Map<String, dynamic>;
      final role = user['role'] as String;

      await ref
          .read(secureStorageProvider)
          .setTokens(access: access, refresh: refresh, role: role);

      if (!mounted) return;
      context.go(role == 'seller' ? Routes.sellerHome : Routes.buyerHome);
    } catch (e) {
      setState(() => _error = 'Invalid or expired OTP');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    if (_resendSeconds > 0) return;
    try {
      await ref.read(apiClientProvider).post(
        ApiEndpoints.otpRequest,
        data: {'phone': widget.phone},
      );
      _startResendTimer();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text(
              l10n.t('verify_otp_title'),
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${l10n.t('verify_otp_sub')} ${widget.phone}',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _otpCtrl,
              keyboardType: TextInputType.number,
              autofocus: true,
              maxLength: 6,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                hintText: '••••••',
                counterText: '',
              ),
              style: theme.textTheme.headlineSmall?.copyWith(
                letterSpacing: 8,
              ),
              textAlign: TextAlign.center,
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ],
            const SizedBox(height: 24),
            PrimaryButton(
              label: l10n.t('verify_continue'),
              loading: _loading,
              onPressed: _verify,
            ),
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: _resendSeconds == 0 ? _resend : null,
                child: Text(
                  _resendSeconds == 0
                      ? l10n.t('send_otp')
                      : '${l10n.t('resend_in')} ${_resendSeconds}s',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
