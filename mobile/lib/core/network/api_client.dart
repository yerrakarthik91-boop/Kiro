import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/secure_storage.dart';

/// Default API base URL.
///
/// Override at run-time with:
///   flutter run --dart-define=API_BASE_URL=https://api.mms.app/v1
///   flutter build web --dart-define=API_BASE_URL=https://api.mms.app/v1
///
/// Defaults:
///   - Web:                       http://localhost:3000/v1
///   - Android emulator:          http://10.0.2.2:3000/v1
///   - iOS simulator / desktop:   http://localhost:3000/v1
const _baseUrlOverride = String.fromEnvironment('API_BASE_URL');

String _defaultBaseUrl() {
  if (_baseUrlOverride.isNotEmpty) return _baseUrlOverride;
  if (kIsWeb) return 'http://localhost:3000/v1';
  // We can't easily detect Android from inside the dart-only layer; the
  // 10.0.2.2 alias is harmless on iOS sim but prefer-localhost is fine for
  // most desktop/iOS users. Override via --dart-define if needed.
  return 'http://10.0.2.2:3000/v1';
}

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(storage);
});

/// Dio wrapper that injects the bearer token and exposes typed helpers.
class ApiClient {
  ApiClient(this._storage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: _defaultBaseUrl(),
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 15),
            contentType: 'application/json',
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final Dio _dio;
  final SecureStorage _storage;

  Dio get dio => _dio;

  Future<Response<dynamic>> post(
    String path, {
    Object? data,
    Map<String, dynamic>? query,
  }) {
    return _dio.post(path, data: data, queryParameters: query);
  }

  Future<Response<dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
  }) {
    return _dio.get(path, queryParameters: query);
  }
}
