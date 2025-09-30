import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile/app.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/providers/quote_provider.dart';
import 'package:mobile/core/services/api_service.dart';

void main() {
  testWidgets('App loads with welcome screen', (WidgetTester tester) async {
    TestWidgetsFlutterBinding.ensureInitialized();

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => QuoteProvider()),
          ProxyProvider<AuthProvider, ApiService>(
            update:
                (context, authProvider, _) =>
                    ApiService(authProvider: authProvider),
          ),
        ],
        child: const MyApp(),
      ),
    );

    expect(
      find.textContaining('Ethical Job Platform', findRichText: true),
      findsOneWidget,
    );
  });
}
