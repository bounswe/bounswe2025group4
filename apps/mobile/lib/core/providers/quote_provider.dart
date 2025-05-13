import 'package:flutter/foundation.dart';
import '../services/quote_service.dart';

class QuoteProvider with ChangeNotifier {
  final QuoteService _quoteService = QuoteService();
  Quote? _quote;
  bool _isLoading = false;

  // Getters
  Quote? get quote => _quote;
  bool get isLoading => _isLoading;
  bool get hasQuote => _quote != null;

  // Fetch a random quote from the API
  Future<void> fetchRandomQuote() async {
    _isLoading = true;
    notifyListeners();

    try {
      _quote = await _quoteService.getRandomQuote();
    } catch (e) {
      print('Error in QuoteProvider: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
