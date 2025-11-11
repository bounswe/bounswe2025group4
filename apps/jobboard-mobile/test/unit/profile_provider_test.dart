import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/profile_provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/models/full_profile.dart';
import 'package:mobile/core/models/profile.dart';
import 'package:mobile/core/providers/auth_provider.dart';

// Mock ApiService for testing without actual API calls
class MockApiService extends ApiService {
  MockApiService() : super(authProvider: AuthProvider());

  FullProfile? _mockProfile;
  bool _shouldThrowError = false;
  String? _errorMessage;

  void setMockProfile(FullProfile? profile) {
    _mockProfile = profile;
  }

  void setShouldThrowError(bool value, {String? errorMessage}) {
    _shouldThrowError = value;
    _errorMessage = errorMessage;
  }

  @override
  Future<FullProfile> getMyProfile() async {
    await Future.delayed(const Duration(milliseconds: 50));
    if (_shouldThrowError) {
      throw Exception(_errorMessage ?? 'API Error');
    }
    if (_mockProfile == null) {
      throw Exception('No profile found');
    }
    return _mockProfile!;
  }

  @override
  Future<FullProfile> getUserProfile(int userId) async {
    await Future.delayed(const Duration(milliseconds: 50));
    if (_shouldThrowError) {
      throw Exception(_errorMessage ?? 'API Error');
    }
    if (_mockProfile == null) {
      throw Exception('No profile found');
    }
    return _mockProfile!;
  }
}

void main() {
  late MockApiService mockApiService;
  late ProfileProvider profileProvider;

  setUp(() {
    mockApiService = MockApiService();
    profileProvider = ProfileProvider(apiService: mockApiService);
  });

  group('ProfileProvider Unit Tests', () {
    test('should start with null profile and not loading', () {
      // Assert initial state
      expect(profileProvider.currentUserProfile, isNull);
      expect(profileProvider.isLoading, isFalse);
      expect(profileProvider.error, isNull);
      expect(profileProvider.hasProfile, isFalse);
    });

    test('should set loading state when fetching profile', () async {
      // Arrange - Mock API to delay response
      final mockProfile = FullProfile(
        profile: Profile(
          id: 1,
          userId: 1,
          fullName: 'Test User',
          bio: 'Test bio',
          profilePicture: null,
          skills: [],
          interests: [],
        ),
        experience: [],
        education: [],
        badges: [],
      );

      mockApiService.setMockProfile(mockProfile);

      // Act - Start fetching (don't await yet)
      final fetchFuture = profileProvider.fetchMyProfile();

      // Assert - Should be loading immediately
      expect(profileProvider.isLoading, isTrue);
      expect(profileProvider.error, isNull);

      // Wait for completion
      await fetchFuture;

      // Assert - Should no longer be loading and have the profile
      expect(profileProvider.isLoading, isFalse);
      expect(profileProvider.currentUserProfile, equals(mockProfile));
      expect(profileProvider.hasProfile, isTrue);
    });

    test('should successfully fetch and store user profile', () async {
      // Arrange
      final mockProfile = FullProfile(
        profile: Profile(
          id: 1,
          userId: 1,
          fullName: 'John Doe',
          bio: 'Software Engineer',
          profilePicture: 'https://example.com/photo.jpg',
          skills: ['Flutter', 'Dart', 'Testing'],
          interests: ['Mobile Dev', 'UI/UX'],
        ),
        experience: [],
        education: [],
        badges: [],
      );

      mockApiService.setMockProfile(mockProfile);

      // Act
      await profileProvider.fetchMyProfile();

      // Assert
      expect(profileProvider.currentUserProfile, equals(mockProfile));
      expect(profileProvider.currentUserProfile?.profile.fullName, 'John Doe');
      expect(profileProvider.currentUserProfile?.profile.skills.length, 3);
      expect(profileProvider.isLoading, isFalse);
      expect(profileProvider.error, isNull);
    });

    test('should handle error when fetching profile fails', () async {
      // Arrange
      mockApiService.setShouldThrowError(
        true,
        errorMessage: 'Network error: Unable to fetch profile',
      );

      // Act
      await profileProvider.fetchMyProfile();

      // Assert
      expect(profileProvider.currentUserProfile, isNull);
      expect(profileProvider.isLoading, isFalse);
      expect(profileProvider.error, isNotNull);
      expect(
        profileProvider.error,
        contains('Network error'),
      );
    });

    test('should clear current user profile', () async {
      // Arrange - First set a profile
      final mockProfile = FullProfile(
        profile: Profile(
          id: 1,
          userId: 1,
          fullName: 'Test User',
          bio: 'Test bio',
          profilePicture: null,
          skills: [],
          interests: [],
        ),
        experience: [],
        education: [],
        badges: [],
      );

      mockApiService.setMockProfile(mockProfile);
      await profileProvider.fetchMyProfile();

      expect(profileProvider.currentUserProfile, isNotNull);

      // Act
      profileProvider.clearCurrentUserProfile();

      // Assert
      expect(profileProvider.currentUserProfile, isNull);
      expect(profileProvider.hasProfile, isFalse);
    });

    test('should fetch user profile by userId', () async {
      // Arrange
      final mockProfile = FullProfile(
        profile: Profile(
          id: 42,
          userId: 42,
          fullName: 'Other User',
          bio: 'Another user bio',
          profilePicture: null,
          skills: ['Python', 'Django'],
          interests: ['Backend'],
        ),
        experience: [],
        education: [],
        badges: [],
      );

      mockApiService.setMockProfile(mockProfile);

      // Act
      await profileProvider.fetchUserProfile(42);

      // Assert
      expect(profileProvider.viewedProfile, equals(mockProfile));
      expect(profileProvider.viewedProfile?.profile.userId, 42);
      expect(profileProvider.viewedProfile?.profile.fullName, 'Other User');
      expect(profileProvider.isLoading, isFalse);
    });
  });
}