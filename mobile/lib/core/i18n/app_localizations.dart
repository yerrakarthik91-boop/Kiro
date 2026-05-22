import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'strings_en.dart';
import 'strings_hi.dart';

/// Lightweight i18n delegate. Replace with full ARB-based pipeline once
/// `flutter gen-l10n` is wired up.
class AppLocalizations {
  AppLocalizations(this.locale);

  final Locale locale;

  static const supportedLocales = [Locale('en'), Locale('hi')];

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static AppLocalizations of(BuildContext context) {
    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);
    return l10n ?? AppLocalizations(const Locale('en'));
  }

  Map<String, String> get _strings =>
      locale.languageCode == 'hi' ? stringsHi : stringsEn;

  String t(String key) {
    final v = _strings[key];
    if (v != null) return v;
    if (kDebugMode) {
      // Surface missing keys during development.
      // ignore: avoid_print
      print('Missing i18n key: $key (${locale.languageCode})');
    }
    return key;
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) =>
      ['en', 'hi'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async =>
      AppLocalizations(locale);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
