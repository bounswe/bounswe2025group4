import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';
import { profileService } from '@/services/profile.service';
import { API_BASE_URL } from '@/test/handlers';
import type { PublicProfile } from '@/types/profile.types';

describe('Profile Service - getPublicProfile', () => {
  const mockPublicProfile: PublicProfile = {
    userId: 123,
    firstName: 'Jane',
    lastName: 'Smith',
    bio: 'Public profile bio for testing',
    imageUrl: 'https://example.com/public-profile.jpg',
    educations: [
      {
        id: 1,
        school: 'Public University',
        degree: 'Master of Science',
        field: 'Software Engineering',
        startDate: '2020-09-01',
        endDate: '2022-06-15',
        description: 'Advanced software engineering studies'
      }
    ],
    experiences: [
      {
        id: 1,
        company: 'Public Tech Co',
        position: 'Senior Developer',
        description: 'Leading development of web applications',
        startDate: '2022-07-01',
        endDate: undefined
      }
    ],
    badges: [
      {
        id: 1,
        name: 'Code Contributor',
        description: 'Made significant contributions to open source projects',
        earnedAt: '2024-01-15T00:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('successful requests', () => {
    it('should fetch public profile successfully', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/123`, async () => {
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      // Act
      const result = await profileService.getPublicProfile(123);

      // Assert
      expect(result).toEqual(mockPublicProfile);
      expect(result.userId).toBe(123);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.bio).toBe('Public profile bio for testing');
      expect(result.educations).toHaveLength(1);
      expect(result.experiences).toHaveLength(1);
      expect(result.badges).toHaveLength(1);
    });

    it('should handle public profile without optional fields', async () => {
      // Arrange
      const minimalProfile: PublicProfile = {
        userId: 456,
        firstName: 'John',
        lastName: 'Doe',
        educations: [],
        experiences: [],
        badges: []
      };

      server.use(
        http.get(`${API_BASE_URL}/profile/456`, async () => {
          return HttpResponse.json(minimalProfile, { status: 200 });
        })
      );

      // Act
      const result = await profileService.getPublicProfile(456);

      // Assert
      expect(result).toEqual(minimalProfile);
      expect(result.bio).toBeUndefined();
      expect(result.imageUrl).toBeUndefined();
      expect(result.educations).toEqual([]);
      expect(result.experiences).toEqual([]);
      expect(result.badges).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle 404 user not found', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/999`, async () => {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        })
      );

      // Act & Assert
      await expect(profileService.getPublicProfile(999)).rejects.toThrow();
    });

    it('should handle 500 server error', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/123`, async () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      // Act & Assert
      await expect(profileService.getPublicProfile(123)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/123`, async () => {
          return HttpResponse.error();
        })
      );

      // Act & Assert
      await expect(profileService.getPublicProfile(123)).rejects.toThrow();
    });

    it('should handle malformed response data', async () => {
      // Arrange
      server.use(
        http.get(`${API_BASE_URL}/profile/123`, async () => {
          return HttpResponse.json(
            { invalidData: 'this is not a valid profile' },
            { status: 200 }
          );
        })
      );

      // Act
      const result = await profileService.getPublicProfile(123);

      // Assert
      // The service should return whatever the API returns
      // Type checking happens at compile time, not runtime
      expect(result).toEqual({ invalidData: 'this is not a valid profile' });
    });
  });

  describe('request parameters', () => {
    it('should send correct user ID in URL path', async () => {
      // Arrange
      let capturedUserId: string | undefined;
      
      server.use(
        http.get(`${API_BASE_URL}/profile/:userId`, async ({ params }) => {
          capturedUserId = params.userId as string;
          return HttpResponse.json(mockPublicProfile, { status: 200 });
        })
      );

      // Act
      await profileService.getPublicProfile(789);

      // Assert
      expect(capturedUserId).toBe('789');
    });

    it('should handle large user IDs correctly', async () => {
      // Arrange
      const largeUserId = 2147483647; // Max 32-bit signed integer
      
      server.use(
        http.get(`${API_BASE_URL}/profile/${largeUserId}`, async () => {
          return HttpResponse.json(
            { ...mockPublicProfile, userId: largeUserId },
            { status: 200 }
          );
        })
      );

      // Act
      const result = await profileService.getPublicProfile(largeUserId);

      // Assert
      expect(result.userId).toBe(largeUserId);
    });
  });
});