import 'dart:convert';
import 'package:http/http.dart' as http;

class TagRecommendationService {
  static Future<Map<String, dynamic>> fetchSuggestions(String title) async {
    try {
      final query = title.trim().split(RegExp(r'\s+')).join('+');
      final url = 'https://api.datamuse.com/words?ml=$query&max=10';

      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final List data = json.decode(response.body);

        final filtered = data
            .where((item) =>
        item['word'] != null &&
            item['word'].toString().isNotEmpty &&
            item['word'].toString().length <= 255)
            .toList();

        filtered.sort((a, b) => (b['score'] ?? 0).compareTo(a['score'] ?? 0));

        final suggestions = filtered
            .take(2)
            .map<String>((item) => item['word'].toString().toUpperCase())
            .toList();

        if (suggestions.isEmpty) {
          return {
            'status': 'empty',
            'message': 'Please add more detail to the title.',
          };
        }

        return {
          'status': 'success',
          'suggestions': suggestions,
        };
      } else {
        return {
          'status': 'error',
          'message': 'Suggestions cannot be created, please try again.',
        };
      }
    } catch (e) {
      return {
        'status': 'error',
        'message': 'Please check your connection, and try again.',
      };
    }
  }
}