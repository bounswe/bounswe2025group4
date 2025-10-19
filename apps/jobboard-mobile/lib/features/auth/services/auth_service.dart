import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/models/auth_response_dto.dart';
import 'package:mobile/core/models/login_request_dto.dart';
import 'package:mobile/core/models/register_request_dto.dart';
import 'package:mobile/core/models/user.dart';
import 'package:mobile/core/models/auth_errors.dart';
import 'package:mobile/core/models/login_request_dto.dart';
import 'package:mobile/core/models/login_result.dart';
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

  Future<LoginResult> login(String username, String password) async {
    final url = Uri.parse('$_baseUrl/auth/login');
    final requestDto = LoginRequestDto(username: username, password: password);
    print('Sending login request to: $url');
    print('Request body: ${jsonEncode(requestDto.toJson())}');
    print(">>> In the login function in Service");

    try {
      final response = await http.post(
        url,
        headers: _getHeaders(null),
        body: jsonEncode(requestDto.toJson()),
      );

      final body = response.body;
      final Map<String, dynamic>? data =
      body.isNotEmpty ? jsonDecode(body) as Map<String, dynamic> : null;

      if (response.statusCode == 200) {
        if (data == null) throw Exception('Empty 200 body');

        final hasToken = data.containsKey('token');
        final hasTemp  = data.containsKey('temporaryToken');

        if (hasToken) {
          return LoginResult.success(AuthResponseDto.fromJson(data));
        } else if (hasTemp) {
          final tmp = data['temporaryToken']?.toString();
          final un  = (data['username'] ?? username).toString();
          final msg = data['message']?.toString();
          if (tmp == null || tmp.isEmpty) {
            throw Exception('Missing temporaryToken in login response.');
          }
          return LoginResult.needsOtp(username: un, temporaryToken: tmp, message: msg);
        } else {
          // Defensive: unknown shape
          throw Exception('Unexpected login response shape.');
        }
      }
      else {
        throw Exception(
          'Failed to login: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      print('Error during login: $e');
      throw Exception('Failed to login. Please check your connection.');
    }
  }

  Future<AuthResponseDto> verifyLoginOtp({
    required String username,
    required String otpCode,
    required String temporaryToken,
  }) async {
    print(">>> In the verifyLoginOTP function in Service");
    final url = Uri.parse('$_baseUrl/auth/login/verify');
    final payload = {
      'username': username,
      'otpCode': otpCode,
      'temporaryToken': temporaryToken,
    };
    print("Payload sent: $payload");
    try {
      final res = await http.post(
        url,
        headers: _getHeaders(null),
        body: jsonEncode(payload),
      );
      print(">>> Response in the verifyLoginOTP: ${res} Body: ${res.body} Response code: ${res.statusCode}");
      final body = res.body;
      final data = body.isNotEmpty ? jsonDecode(body) as Map<String, dynamic> : null;
      print("data: $data");

      if (res.statusCode == 200 && data != null) {
        print("Service returning...");
        return AuthResponseDto.fromJson(data);
      }
      print("Status code invalid in service");

      final msg = data?['message']?.toString();
      throw Exception('Failed to verify OTP: ${res.statusCode} ${res.reasonPhrase}'
          '${msg != null ? " – $msg" : ""}');
    } catch (e) {
      rethrow;
    }
  }


  Future<AuthResponseDto> register(RegisterRequestDto requestDto) async {
    final url = Uri.parse('$_baseUrl/auth/register');
    print(">>> URL: $url");
    print(">>> Request DTO: ${requestDto.toJson()}");

    try {
      final response = await http.post(
        url,
        headers: _getHeaders(null),
        body: jsonEncode(requestDto.toJson()),
      );
      print('Register Response status code: ${response.statusCode}');
      print('Register Response body: ${response.body}');

      final String body = response.body;
      final Map<String, dynamic>? data =
      body.isNotEmpty ? jsonDecode(body) as Map<String, dynamic> : null;

      if (response.statusCode == 200) {
        if (data == null) {
          throw Exception('Empty response body on 200');
        }
        return AuthResponseDto.fromJson(data);
      }

      if (response.statusCode == 201) {
        final msg = data?['message']?.toString() ??
            'Please verify your email to complete registration.';
        throw NeedsEmailVerificationException(msg);
      }

      final serverMsg = data?['message']?.toString();
      throw Exception(
        'Failed to register: ${response.statusCode} ${response.reasonPhrase}'
            '${serverMsg != null ? " – $serverMsg" : ""}',
      );
    } catch (e) {
      print('Error during registration: $e');
      rethrow;
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
