import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/models/auth_response_dto.dart';
import 'package:mobile/core/models/login_request_dto.dart';
import 'package:mobile/core/models/register_request_dto.dart';

class AuthService {
  final String _baseUrl = AppConstants.baseUrl;

  Future<AuthResponseDto> login(String username, String password) async {
    final url = Uri.parse('$_baseUrl/auth/login');
    final requestDto = LoginRequestDto(username: username, password: password);
    print('Sending login request to: $url');
    print('Request body: ${jsonEncode(requestDto.toJson())}');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestDto.toJson()),
      );

      print('Response status code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return AuthResponseDto.fromJson(responseData);
      } else {
        // Handle non-200 responses (e.g., 401 Unauthorized, 404 Not Found)
        // You might want to parse error messages from the response body
        throw Exception(
          'Failed to login: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      // Handle network errors or exceptions during the request
      print('Error during login: $e');
      throw Exception('Failed to login. Please check your connection.');
    }
  }

  Future<AuthResponseDto> register(RegisterRequestDto requestDto) async {
    final url = Uri.parse('$_baseUrl/auth/register');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestDto.toJson()),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Assuming 201 Created or 200 OK are success
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return AuthResponseDto.fromJson(responseData);
      } else {
        // Handle errors (e.g., 400 Bad Request, 409 Conflict)
        // You might want to parse specific error messages from the backend
        throw Exception(
          'Failed to register: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      // Handle network errors or exceptions
      print('Error during registration: $e');
      throw Exception('Failed to register. Please try again later.');
    }
  }
}
