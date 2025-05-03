import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/models/auth_response_dto.dart';
import 'package:mobile/core/models/login_request_dto.dart';
import 'package:mobile/core/models/register_request_dto.dart';
import 'package:mobile/core/models/user.dart';

class AuthService {
  final String _baseUrl = AppConstants.baseUrl;

  Map<String, String> _getHeaders(String? token) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<AuthResponseDto> login(String username, String password) async {
    final url = Uri.parse('$_baseUrl/auth/login');
    final requestDto = LoginRequestDto(username: username, password: password);
    print('Sending login request to: $url');
    print('Request body: ${jsonEncode(requestDto.toJson())}');

    try {
      final response = await http.post(
        url,
        headers: _getHeaders(null),
        body: jsonEncode(requestDto.toJson()),
      );

      print('Login Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return AuthResponseDto.fromJson(responseData);
      } else {
        throw Exception(
          'Failed to login: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      print('Error during login: $e');
      throw Exception('Failed to login. Please check your connection.');
    }
  }

  Future<AuthResponseDto> register(RegisterRequestDto requestDto) async {
    final url = Uri.parse('$_baseUrl/auth/register');

    try {
      final response = await http.post(
        url,
        headers: _getHeaders(null),
        body: jsonEncode(requestDto.toJson()),
      );
      print('Register Response status code: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return AuthResponseDto.fromJson(responseData);
      } else {
        throw Exception(
          'Failed to register: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      print('Error during registration: $e');
      throw Exception('Failed to register. Please try again later.');
    }
  }

  /// Fetches user details from GET /api/users/{id}
  /// Requires the user ID and the authentication token.
  Future<User> getUserDetails(String userId, String token) async {
    final url = Uri.parse('$_baseUrl/users/$userId'); // Use userId in the path
    print('Fetching user details from: $url');

    try {
      final response = await http.get(
        url,
        headers: _getHeaders(token), // Pass the token for authorization
      );

      print('User Details Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        print('User Details Response body: $responseData');
        // Use the User.fromJson factory
        return User.fromJson(responseData);
      } else {
        // Handle errors like 404 Not Found if the ID is invalid
        throw Exception(
          'Failed to fetch user details: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      print('Error fetching user details: $e');
      // Rethrow a more specific or user-friendly error if needed
      throw Exception('Failed to fetch user details.');
    }
  }
}
