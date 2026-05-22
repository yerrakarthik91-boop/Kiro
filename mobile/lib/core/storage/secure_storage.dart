import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final secureStorageProvider = Provider<SecureStorage>((_) => SecureStorage());

/// Thin wrapper over `flutter_secure_storage` for tokens & role caching.
class SecureStorage {
  static const _accessKey = 'mms.access';
  static const _refreshKey = 'mms.refresh';
  static const _roleKey = 'mms.role';

  final _storage = const FlutterSecureStorage();

  Future<void> setTokens({
    required String access,
    required String refresh,
    required String role,
  }) async {
    await _storage.write(key: _accessKey, value: access);
    await _storage.write(key: _refreshKey, value: refresh);
    await _storage.write(key: _roleKey, value: role);
  }

  Future<String?> getAccessToken() => _storage.read(key: _accessKey);
  Future<String?> getRefreshToken() => _storage.read(key: _refreshKey);
  Future<String?> getRole() => _storage.read(key: _roleKey);

  Future<void> clear() async {
    await _storage.deleteAll();
  }
}
