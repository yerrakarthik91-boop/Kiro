import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mms/core/theme/app_theme.dart';
import 'package:mms/features/user_selection/user_selection_screen.dart';

/// Smoke test — pumps the User Selection screen with the production light
/// theme to make sure it builds and renders the two role buttons.
///
/// Replaces the auto-generated widget_test.dart that flutter create writes.
/// We commit this file so `flutter create` does not overwrite it on CI runs.
void main() {
  testWidgets('User Selection renders both role buttons', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: const UserSelectionScreen(),
      ),
    );
    expect(find.text('Milk Management System'), findsOneWidget);
    expect(find.text('I am a Milk Seller'), findsOneWidget);
    expect(find.text('I am a Milk Buyer'), findsOneWidget);
  });
}
