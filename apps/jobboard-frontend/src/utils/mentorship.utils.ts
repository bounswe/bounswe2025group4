import type {
  MentorProfileDetailDTO,
  MentorReviewDTO,
  MentorshipDetailsDTO,
} from '@/types/api.types';
import type { Mentor, MentorshipReview, Mentorship } from '@/types/mentor';

/**
 * Converts MentorProfileDetailDTO from backend to frontend Mentor type.
 * Uses a hybrid approach: real data from backend, placeholders for missing fields.
 * @param dto - Backend mentor profile DTO
 * @param profileImageUrl - Optional profile image URL from profile API
 */
export function convertMentorProfileToMentor(
  dto: MentorProfileDetailDTO, 
  profileImageUrl?: string,
  normalProfile?: { 
    bio?: string; 
    experiences?: Array<{ position: string; company: string; description?: string; startDate: string; endDate?: string }>;
    educations?: Array<{ degree: string; school: string; field?: string; startDate: string; endDate?: string }>;
    skills?: Array<{ name: string }>;
    interests?: Array<{ name: string }>;
  },
  mentorBio?: string // Mentor-specific bio (separate from normal profile)
): Mentor {
  // Mentor-specific bio (separate from normal profile bio)
  // If mentorBio is provided, use it; otherwise fallback to normal profile bio; otherwise placeholder
  const bio = mentorBio || normalProfile?.bio || "Experienced mentor passionate about helping others grow in their careers.";
  
  // Title from normal profile experience (most recent position) or fallback
  let title = "";
  if (normalProfile?.experiences && normalProfile.experiences.length > 0) {
    // Get the most recent experience (assuming they're sorted by date)
    const mostRecentExp = normalProfile.experiences[0];
    if (mostRecentExp.company) {
      title = `${mostRecentExp.position} at ${mostRecentExp.company}`;
    } else {
      title = mostRecentExp.position;
    }
  } else if (dto.expertise && dto.expertise.length > 0) {
    // Fallback to expertise if no experience (without "Mentor" suffix)
    title = dto.expertise.join(', ');
  } else {
    // No title available
    title = "";
  }
  
  // Languages from normal profile interests (if available) or placeholder
  const languages = normalProfile?.interests?.map(i => i.name) || ["English"];
  
  // Achievements placeholder (not in normal profile)
  const placeholderAchievements: string[] = [];

  return {
    id: dto.id,
    name: dto.username, // Use username for mentor name
    title: title,
    bio: bio, // Mentor-specific bio (separate from normal profile)
    rating: dto.averageRating,
    reviews: dto.reviewCount,
    mentees: dto.currentMentees,
    capacity: dto.maxMentees,
    tags: dto.expertise, // Mentor-specific expertise
    experience: "", // Will be shown from normal profile
    education: "", // Will be shown from normal profile
    linkedinUrl: undefined, // Not in DTO
    githubUrl: undefined, // Not in DTO
    websiteUrl: undefined, // Not in DTO
    hourlyRate: undefined, // Not in DTO
    availability: "", // Not in DTO yet
    languages: languages, // From normal profile interests
    specialties: dto.expertise, // Mentor-specific expertise
    achievements: placeholderAchievements,
    profileImage: profileImageUrl, // Use profile image URL if provided, otherwise undefined (AvatarFallback will show initials)
  };
}

/**
 * Converts MentorReviewDTO from backend to frontend MentorshipReview type.
 * @param dto - Backend review DTO
 * @param menteeAvatarUrl - Optional mentee avatar URL from profile API
 */
export function convertMentorReviewToMentorshipReview(dto: MentorReviewDTO, menteeAvatarUrl?: string): MentorshipReview {
  return {
    id: dto.id.toString(),
    menteeName: dto.reviewerUsername,
    menteeAvatar: menteeAvatarUrl, // Use profile avatar URL if provided, otherwise undefined (AvatarFallback will show initials)
    rating: dto.rating,
    comment: dto.comment,
    date: new Date(dto.createdAt).toLocaleDateString(),
    mentorshipDuration: "N/A", // Not in DTO
  };
}

/**
 * Converts MentorshipDetailsDTO from backend to frontend Mentorship type.
 * Uses a hybrid approach: real data from backend, placeholders for missing fields.
 * @param dto - Backend mentorship details DTO
 * @param mentorAvatarUrl - Optional mentor avatar URL from profile API
 */
export function convertMentorshipDetailsToMentorship(dto: MentorshipDetailsDTO, mentorAvatarUrl?: string): Mentorship {
  // Determine overall status based on request and review status
  // Priority: reviewStatus > requestStatus
  let status: Mentorship['status'];
  
  const reviewStatusUpper = dto.reviewStatus?.toUpperCase();
  const requestStatusUpper = dto.requestStatus?.toUpperCase();
  
  // Check reviewStatus first (higher priority)
  if (reviewStatusUpper === 'ACTIVE') {
    status = 'active';
  } else if (reviewStatusUpper === 'COMPLETED') {
    status = 'completed';
  } else if (reviewStatusUpper === 'CLOSED') {
    status = 'rejected'; // Or 'closed', depending on desired frontend representation
  } 
  // If reviewStatus is not set or doesn't match, check requestStatus
  else if (requestStatusUpper === 'COMPLETED') {
    status = 'completed';
  } else if (requestStatusUpper === 'ACCEPTED') {
    // ACCEPTED means mentorship is active (even if reviewStatus is not yet set)
    status = 'active';
  } else if (requestStatusUpper === 'PENDING') {
    status = 'pending';
  } else if (requestStatusUpper === 'REJECTED' || requestStatusUpper === 'DECLINED') {
    status = 'rejected';
  } else {
    // Default: if we have a reviewStatus but it's not handled above, check requestStatus
    // If no status at all, default to pending
    status = requestStatusUpper ? 'pending' : 'pending';
  }

  return {
    id: dto.mentorshipRequestId.toString(),
    mentorId: dto.mentorId.toString(),
    mentorName: dto.mentorUsername,
    mentorTitle: "Mentor", // Placeholder
    mentorAvatar: mentorAvatarUrl, // Use profile avatar URL if provided, otherwise undefined (AvatarFallback will show initials)
    menteeId: "current_user_id", // This should be dynamically set
    menteeName: "You", // This should be dynamically set
    status: status,
    createdAt: dto.requestCreatedAt,
    acceptedAt: status === 'active' || status === 'completed' ? new Date().toISOString() : undefined, // Placeholder
    completedAt: status === 'completed' ? new Date().toISOString() : undefined, // Placeholder
    goals: ["No specific goals provided"], // Not in DTO
    expectedDuration: "Flexible", // Not in DTO
    message: "No message provided", // Not in DTO
    preferredTime: "Flexible", // Not in DTO
    resumeReviewId: dto.resumeReviewId, // For completing mentorship
    conversationId: dto.conversationId ? dto.conversationId.toString() : undefined,
  };
}

