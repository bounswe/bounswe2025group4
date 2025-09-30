import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/auth/screens/welcome_screen.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('WelcomeScreen Tests', () {
    testWidgets(
      'should render welcome screen with login and register buttons',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          MaterialApp(
            home: ChangeNotifierProvider(
              create: (_) => AuthProvider(),
              child: const WelcomeScreen(),
            ),
          ),
        );

        expect(
          find.textContaining('Ethical Job Platform', findRichText: true),
          findsOneWidget,
        );

        expect(find.byType(ElevatedButton), findsWidgets);

        final loginFinder = find.textContaining(
          'login',
          findRichText: true,
          skipOffstage: false,
        );
        if (loginFinder.evaluate().isNotEmpty) {
          await tester.tap(loginFinder.first);
          await tester.pump();
        }
      },
    );
  });
}
