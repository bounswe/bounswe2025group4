import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:mobile/core/services/tag_recommendation_service.dart';
import 'tag_recommendation_service_test.mocks.dart';

@GenerateMocks([http.Client])
void main() {
  test('returns success with suggestions when response is valid', () async {
    final mockClient = MockClient();

    final mockResponse = jsonEncode([
      {'word': 'flutter', 'score': 100},
      {'word': 'dart', 'score': 90},
    ]);

    when(mockClient.get(any)).thenAnswer(
          (_) async => http.Response(mockResponse, 200),
    );

    final result = await TagRecommendationService.fetchSuggestions(
      'learn flutter',
      client: mockClient,
    );

    expect(result['status'], 'success');
    expect(result['suggestions'], contains('FLUTTER'));
  });

  test('returns empty when no suggestions found', () async {
    final mockClient = MockClient();

    when(mockClient.get(any)).thenAnswer(
          (_) async => http.Response('[]', 200),
    );

    final result = await TagRecommendationService.fetchSuggestions(
      'no match',
      client: mockClient,
    );

    expect(result['status'], 'empty');
  });

  test('returns error when exception is thrown', () async {
    final mockClient = MockClient();

    when(mockClient.get(any)).thenThrow(Exception('fail'));

    final result = await TagRecommendationService.fetchSuggestions(
      'fail',
      client: mockClient,
    );

    expect(result['status'], 'error');
  });
}