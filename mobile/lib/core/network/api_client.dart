import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/secure_storage.dart';

/// Default API base URL. Override at run-time with:
///   flutter run --dart-define=API_BASE_URL=https://api.mms.app/v1
const _defaultBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  // Android emulator can reach host via 10.0.2.2; for iOS sim use localhost.
  defaultValue: 'http://10.0.2.2:3000/v1',
);

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return ApiClient(storage);
});

/// Dio wrapper that injects the bearer token and handles refresh.
class ApiClient {
  ApiClient(this._storage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: _defaultBaseUrl,
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
