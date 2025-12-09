import { http, HttpResponse } from 'msw';
import type {
  MentorshipDetailsDTO,
  MentorshipRequestDTO,
  ResumeFileResponseDTO,
  ResumeReviewDTO,
} from '@shared/types/api.types';
import { API_BASE_URL } from './handlers';

const mockMentorshipRequests: MentorshipRequestDTO[] = [
  {
    id: '1',
    requesterId: '10',
    mentorId: '1',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    message: 'Looking for guidance',
    goals: ['Career growth'],
    preferredTime: 'Evenings',
  },
  {
    id: '2',
    requesterId: '11',
    mentorId: '1',
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
    message: 'Need resume review',
    goals: ['Resume polish'],
  },
];

const mockMenteeMentorshipsByUser: Record<string, MentorshipDetailsDTO[]> = {
  '1': [
    {
      mentorshipRequestId: 2,
      requestStatus: 'ACCEPTED',
      requestCreatedAt: new Date().toISOString(),
      mentorId: 1,
      mentorUsername: 'mentor-one',
      resumeReviewId: 101,
      reviewStatus: 'ACTIVE',
      conversationId: 9001,
    },
  ],
  '10': [
    {
      mentorshipRequestId: 3,
      requestStatus: 'PENDING',
      requestCreatedAt: new Date().toISOString(),
      mentorId: 1,
      mentorUsername: 'mentor-one',
      resumeReviewId: 102,
      reviewStatus: 'ACTIVE',
      conversationId: 9002,
    },
  ],
};

const mockResumeReviews: Record<number, ResumeReviewDTO> = {
  101: {
    resumeReviewId: 101,
    fileUrl: 'https://example.com/resume-101.pdf',
    reviewStatus: 'ACTIVE',
    feedback: 'Looks good so far',
  },
  102: {
    resumeReviewId: 102,
    fileUrl: null,
    reviewStatus: 'ACTIVE',
    feedback: null,
  },
};

export const mentorshipHandlers = [
  http.get(`${API_BASE_URL}/mentorship/mentee/:menteeId/requests`, ({ params }) => {
    const { menteeId } = params;
    const menteeKey = String(menteeId ?? '');
    const mentorships = mockMenteeMentorshipsByUser[menteeKey] ?? [];
    return HttpResponse.json(mentorships, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/mentorship/mentor/:mentorId/requests`, ({ params }) => {
    const { mentorId } = params;
    const requests = mockMentorshipRequests.filter(
      (request) => String(request.mentorId) === String(mentorId)
    );
    return HttpResponse.json(requests, { status: 200 });
  }),

  http.patch(
    `${API_BASE_URL}/mentorship/requests/:requestId/respond`,
    async ({ params, request }) => {
      const { requestId } = params;
      const body = (await request.json()) as { accept: boolean };
      const index = mockMentorshipRequests.findIndex((r) => r.id === String(requestId));
      if (index === -1) {
        return HttpResponse.json({ message: 'Request not found' }, { status: 404 });
      }

      mockMentorshipRequests[index] = {
        ...mockMentorshipRequests[index],
        status: body.accept ? 'ACCEPTED' : 'REJECTED',
      };

      return HttpResponse.json(mockMentorshipRequests[index], { status: 200 });
    }
  ),

  http.post(`${API_BASE_URL}/mentorship/requests`, async ({ request }) => {
    const body = (await request.json()) as { mentorId: number };
    const newRequest: MentorshipRequestDTO = {
      id: String(mockMentorshipRequests.length + 1),
      requesterId: '1',
      mentorId: String(body.mentorId),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    mockMentorshipRequests.push(newRequest);
    return HttpResponse.json(newRequest, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/mentorship/:resumeReviewId`, ({ params }) => {
    const { resumeReviewId } = params;
    const review = mockResumeReviews[Number(resumeReviewId)];
    if (!review) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(review, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/mentorship/:resumeReviewId/file`, ({ params }) => {
    const { resumeReviewId } = params;
    const review = mockResumeReviews[Number(resumeReviewId)];
    if (!review || !review.fileUrl) {
      return HttpResponse.json({ message: 'No file' }, { status: 404 });
    }
    return HttpResponse.json({ fileUrl: review.fileUrl }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/mentorship/:resumeReviewId/file`, async ({ params }) => {
    const { resumeReviewId } = params;
    const uploadResponse: ResumeFileResponseDTO = {
      resumeReviewId: Number(resumeReviewId),
      fileUrl: `https://example.com/resume-${resumeReviewId}-uploaded.pdf`,
      reviewStatus: 'ACTIVE',
      uploadedAt: new Date().toISOString(),
    };
    mockResumeReviews[Number(resumeReviewId)] = {
      resumeReviewId: Number(resumeReviewId),
      fileUrl: uploadResponse.fileUrl,
      reviewStatus: 'ACTIVE',
      feedback: null,
    };
    return HttpResponse.json(uploadResponse, { status: 200 });
  }),
];

