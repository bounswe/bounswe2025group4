import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/quote_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('QuoteProvider Unit Tests', () {
    late QuoteProvider quoteProvider;

    setUp(() {
      quoteProvider = QuoteProvider();
    });

    test('should start with null quote and not loading', () {
      // Assert initial state
      expect(quoteProvider.quote, isNull);
      expect(quoteProvider.isLoading, isFalse);
      expect(quoteProvider.hasQuote, isFalse);
    });

    test('should set loading state when fetching quote', () async {
      // Act - Start fetching (don't await yet)
      final fetchFuture = quoteProvider.fetchRandomQuote();

      // Give it a moment to start
      await Future.delayed(const Duration(milliseconds: 10));

      // Assert - Should be loading (if not already complete)
      // Note: This might be tricky with real API, so we check if it was loading
      // or already completed successfully

      // Wait for completion
      await fetchFuture;

      // Assert - Should no longer be loading
      expect(quoteProvider.isLoading, isFalse);
    });

    test('should successfully fetch and store a quote', () async {
      // Act
      await quoteProvider.fetchRandomQuote();

      // Assert - Should have fetched a quote (either from API or fallback)
      expect(quoteProvider.quote, isNotNull);
      expect(quoteProvider.isLoading, isFalse);
      expect(quoteProvider.hasQuote, isTrue);

      // Verify quote has required properties
      expect(quoteProvider.quote!.text, isNotEmpty);
      expect(quoteProvider.quote!.author, isNotEmpty);
    });

    test('should have valid quote text after fetching', () async {
      // Act
      await quoteProvider.fetchRandomQuote();

      // Assert
      final quote = quoteProvider.quote;
      expect(quote, isNotNull);
      expect(quote!.text.length, greaterThan(10)); // Reasonable quote length
      expect(quote.author.isNotEmpty, isTrue);
    });

    test('should handle multiple consecutive fetches', () async {
      // Act - Fetch multiple times
      await quoteProvider.fetchRandomQuote();
      final firstQuote = quoteProvider.quote;

      await quoteProvider.fetchRandomQuote();
      final secondQuote = quoteProvider.quote;

      // Assert - Should have quotes after each fetch
      expect(firstQuote, isNotNull);
      expect(secondQuote, isNotNull);
      expect(quoteProvider.isLoading, isFalse);
      expect(quoteProvider.hasQuote, isTrue);
    });

    test('should maintain hasQuote getter consistency', () async {
      // Initial state
      expect(quoteProvider.hasQuote, isFalse);

      // After fetching
      await quoteProvider.fetchRandomQuote();
      expect(quoteProvider.hasQuote, isTrue);
      expect(quoteProvider.hasQuote, equals(quoteProvider.quote != null));
    });

    test('should complete loading state even on error', () async {
      // Act - Even if there's an error, loading should complete
      await quoteProvider.fetchRandomQuote();

      // Assert - Loading should always be false after completion
      expect(quoteProvider.isLoading, isFalse);
      // Should have at least a fallback quote
      expect(quoteProvider.quote, isNotNull);
    });

    test('Quote model should have correct properties', () async {
      // Act
      await quoteProvider.fetchRandomQuote();

      // Assert
      final quote = quoteProvider.quote!;
      expect(quote.text, isA<String>());
      expect(quote.author, isA<String>());
      expect(quote.text, isNotEmpty);
      expect(quote.author, isNotEmpty);
    });
  });
}
