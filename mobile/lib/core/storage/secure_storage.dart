import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

final secureStorageProvider =
    Provider<SecureStorage>((_) => SecureStorage._create());

/// Token + user-preference storage.
///
/// On native (iOS Keychain / Android Keystore) we use `flutter_secure_storage`.
/// On web, secure-storage falls back to localStorage which is not actually
/// secure — for the demo we use `shared_preferences` directly so behavior is
/// predictable. Tokens persist across browser refreshes, which is what the
/// demo needs; production should switch to httpOnly-cookie auth.
class SecureStorage {
  SecureStorage._create() : _impl = kIsWeb ? _WebStore() : _NativeStore();

  final _Store _impl;

  static const _accessKey = 'mms.access';
  static const _refreshKey = 'mms.refresh';
  static const _roleKey = 'mms.role';

  Future<void> setTokens({
    required String access,
    required String refresh,
    required String role,
  }) async {
    await _impl.write(_accessKey, access);
    await _impl.write(_refreshKey, refresh);
    await _impl.write(_roleKey, role);
  }

  Future<String?> getAccessToken() => _impl.read(_accessKey);
  Future<String?> getRefreshToken() => _impl.read(_refreshKey);
  Future<String?> getRole() => _impl.read(_roleKey);

  Future<void> clear() async {
    await _impl.clear();
  }
}

abstract class _Store {
  Future<void> write(String key, String value);
  Future<String?> read(String key);
  Future<void> clear();
}

class _NativeStore implements _Store {
  final _storage = const FlutterSecureStorage();

  @override
  Future<void> write(String key, String value) =>
      _storage.write(key: key, value: value);

  @override
  Future<String?> read(String key) => _storage.read(key: key);

  @override
  Future<void> clear() => _storage.deleteAll();
}

class _WebStore implements _Store {
  Future<SharedPreferences> get _prefs => SharedPreferences.getInstance();

  @override
  Future<void> write(String key, String value) async {
    final p = await _prefs;
    await p.setString(key, value);
  }

  @override
  Future<String?> read(String key) async {
    final p = await _prefs;
    return p.getString(key);
  }

  @override
  Future<void> clear() async {
    final p = await _prefs;
    for (final k in const ['mms.access', 'mms.refresh', 'mms.role']) {
      await p.remove(k);
    }
  }
}
