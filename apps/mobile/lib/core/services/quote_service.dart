import 'dart:convert';
import 'package:http/http.dart' as http;

class Quote {
  final String text;
  final String author;

  Quote({required this.text, required this.author});

  factory Quote.fromJson(Map<String, dynamic> json) {
    return Quote(text: json['q'] ?? '', author: json['a'] ?? '');
  }
}

class QuoteService {
  static const String _baseUrl = 'https://zenquotes.io/api';

  Future<Quote> getRandomQuote() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/random'));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          return Quote.fromJson(data[0]);
        }
      }

      return Quote(
        text:
            "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela",
      );
    } catch (e) {
      return Quote(
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
      );
    }
  }
}
