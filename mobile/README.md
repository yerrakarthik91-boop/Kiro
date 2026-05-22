# MMS Mobile (Flutter)

The Milk Management System mobile app — Android & iOS, a single Flutter codebase that hosts both the **Seller Panel** and the **Buyer Panel**.

## Stack

- **Flutter 3.19+** / **Dart 3.3+**
- **Material Design 3** with light + dark themes
- **Riverpod** for state management
- **go_router** for navigation
- **Dio** for HTTP
- **flutter_secure_storage** for tokens

## Quick start

This skeleton ships only the `lib/` source. Generate the platform-native folders with:

```bash
cd mobile
flutter create . --project-name mms --platforms android,ios
flutter pub get
flutter run
```

By default the app talks to `http://10.0.2.2:3000/v1` (Android emulator) or `http://localhost:3000/v1` (iOS simulator). Override with `--dart-define=API_BASE_URL=https://api.mms.app/v1`.

## Project layout

```
lib/
├── main.dart                          App bootstrap, ProviderScope
├── app.dart                           MaterialApp with theme + router
├── core/
│   ├── theme/
│   │   ├── app_theme.dart             Light + Dark MD3 themes
│   │   └── app_colors.dart            Color tokens
│   ├── routing/
│   │   └── app_router.dart            go_router config + deep-link guards
│   ├── network/
│   │   ├── api_client.dart            Dio wrapper with auth interceptor
│   │   └── api_endpoints.dart         Path constants
│   ├── storage/
│   │   └── secure_storage.dart        Tokens, user prefs
│   └── i18n/
│       ├── app_localizations.dart     Tiny i18n delegate
│       ├── strings_en.dart
│       └── strings_hi.dart
├── features/
│   ├── splash/                        SCR-01 Splash
│   ├── user_selection/                SCR-02 User Selection
│   ├── auth/                          SCR-03..05 Login + OTP Verify
│   ├── seller/                        SE-01 Seller Dashboard (stub)
│   └── buyer/                         BU-01 Buyer Dashboard (stub)
└── shared/
    └── widgets/                       Reusable widgets (logo, primary button)
```

The screen-ID labels in the code map to `docs/06-Mobile-App-Screens.md`.
