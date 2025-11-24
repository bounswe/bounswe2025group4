import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from './handlers';
import type {
    WorkplaceBriefResponse,
    WorkplaceDetailResponse,
    WorkplaceCreateRequest,
    WorkplaceUpdateRequest,
    PaginatedWorkplaceResponse,
    EmployerWorkplaceBrief,
} from '@/types/workplace.types';

// Mock Data
const mockWorkplaces: WorkplaceBriefResponse[] = [
    {
        id: 1,
        companyName: 'Tech Corp',
        imageUrl: 'https://example.com/tech-corp.jpg',
        sector: 'Technology',
        location: 'San Francisco, CA',
        shortDescription: 'Leading tech innovation',
        overallAvg: 4.5,
        ethicalTags: ['Sustainability', 'Diversity'],
        ethicalAverages: { 'Sustainability': 4.0, 'Diversity': 5.0 }
    },
    {
        id: 2,
        companyName: 'Green Energy Inc',
        imageUrl: 'https://example.com/green-energy.jpg',
        sector: 'Energy',
        location: 'Austin, TX',
        shortDescription: 'Renewable energy solutions',
        overallAvg: 4.8,
        ethicalTags: ['Environment', 'Fair Trade'],
        ethicalAverages: { 'Environment': 5.0, 'Fair Trade': 4.6 }
    },
    {
        id: 3,
        companyName: 'Health Plus',
        imageUrl: undefined,
        sector: 'Healthcare',
        location: 'Boston, MA',
        shortDescription: 'Healthcare for everyone',
        overallAvg: 3.9,
        ethicalTags: ['Healthcare Access'],
        ethicalAverages: { 'Healthcare Access': 3.9 }
    }
];

const mockWorkplaceDetail: WorkplaceDetailResponse = {
    id: 1,
    companyName: 'Tech Corp',
    imageUrl: 'https://example.com/tech-corp.jpg',
    sector: 'Technology',
    location: 'San Francisco, CA',
    shortDescription: 'Leading tech innovation',
    detailedDescription: 'We are a global leader in technology innovation, committed to creating a better future through software.',
    website: 'https://techcorp.example.com',
    ethicalTags: ['Sustainability', 'Diversity'],
    overallAvg: 4.5,
    ethicalAverages: { 'Sustainability': 4.0, 'Diversity': 5.0 },
    reviewCount: 120,
    employers: [
        {
            userId: 1,
            username: 'employer1',
            email: 'employer1@techcorp.com',
            role: 'ADMIN',
            joinedAt: '2023-01-01'
        }
    ],
    recentReviews: [
        {
            id: 101,
            workplaceId: 1,
            userId: 5,
            username: 'user5',
            title: 'Great place to work',
            content: 'I learned a lot here.',
            anonymous: false,
            helpfulCount: 5,
            overallRating: 5,
            ethicalPolicyRatings: { 'Sustainability': 5 },
            createdAt: '2024-01-10',
            updatedAt: '2024-01-10'
        }
    ],
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01'
};

const mockEmployerWorkplaces: EmployerWorkplaceBrief[] = [
    {
        role: 'ADMIN',
        workplace: mockWorkplaces[0]
    }
];

export const workplaceHandlers = [
    // Get Workplaces (List)
    http.get(`${API_BASE_URL}/workplace`, async ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || 0);
        const size = Number(url.searchParams.get('size') || 12);
        const search = url.searchParams.get('search')?.toLowerCase();
        const sector = url.searchParams.get('sector');
        const location = url.searchParams.get('location')?.toLowerCase();
        const minRating = Number(url.searchParams.get('minRating') || 0);

        let filtered = [...mockWorkplaces];

        if (search) {
            filtered = filtered.filter(w => w.companyName.toLowerCase().includes(search));
        }
        if (sector) {
            filtered = filtered.filter(w => w.sector === sector);
        }
        if (location) {
            filtered = filtered.filter(w => w.location.toLowerCase().includes(location));
        }
        if (minRating > 0) {
            filtered = filtered.filter(w => w.overallAvg >= minRating);
        }

        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const content = filtered.slice(page * size, (page + 1) * size);

        const response: PaginatedWorkplaceResponse = {
            content,
            page,
            size,
            totalElements,
            totalPages,
            hasNext: page < totalPages - 1,
            hasPrevious: page > 0
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    // Get Employer Workplaces
    http.get(`${API_BASE_URL}/workplace/employers/me`, async () => {
        return HttpResponse.json(mockEmployerWorkplaces, { status: 200 });
    }),

    // Get Workplace Detail
    http.get(`${API_BASE_URL}/workplace/:id`, async ({ params }) => {
        const { id } = params;
        const workplaceId = Number(id);

        if (workplaceId === 999) { // Mock not found
            return new HttpResponse(null, { status: 404 });
        }

        const workplace = mockWorkplaces.find(w => w.id === workplaceId);
        if (workplace) {
            // Merge brief info with detail structure for consistency in tests if needed
            // For now, returning the static detail mock but overriding ID/Name if it matches list
            return HttpResponse.json({
                ...mockWorkplaceDetail,
                id: workplace.id,
                companyName: workplace.companyName,
                sector: workplace.sector
            }, { status: 200 });
        }

        return HttpResponse.json(mockWorkplaceDetail, { status: 200 });
    }),

    // Create Workplace
    http.post(`${API_BASE_URL}/workplace`, async ({ request }) => {
        const body = await request.json() as WorkplaceCreateRequest;

        const newWorkplace: WorkplaceDetailResponse = {
            ...mockWorkplaceDetail,
            id: Math.floor(Math.random() * 1000) + 100,
            companyName: body.companyName,
            sector: body.sector,
            location: body.location,
            shortDescription: body.shortDescription,
            detailedDescription: body.detailedDescription,
            website: body.website,
            ethicalTags: body.ethicalTags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return HttpResponse.json(newWorkplace, { status: 201 });
    }),

    // Update Workplace
    http.put(`${API_BASE_URL}/workplace/:id`, async ({ request, params }) => {
        const body = await request.json() as WorkplaceUpdateRequest;
        const { id } = params;

        return HttpResponse.json({
            ...mockWorkplaceDetail,
            id: Number(id),
            ...body
        }, { status: 200 });
    }),

    // Upload Image
    http.post(`${API_BASE_URL}/workplace/:id/image`, async () => {
        return HttpResponse.json({
            imageUrl: 'https://example.com/new-image.jpg',
            updatedAt: new Date().toISOString()
        }, { status: 200 });
    }),

    // Delete Image
    http.delete(`${API_BASE_URL}/workplace/:id/image`, async () => {
        return HttpResponse.json({
            message: 'Image deleted successfully',
            timestamp: new Date().toISOString()
        }, { status: 200 });
    }),

    // Join Workplace Request
    http.post(`${API_BASE_URL}/workplace/:id/join`, async () => {
        return HttpResponse.json({
            message: 'Join request sent successfully',
            timestamp: new Date().toISOString()
        }, { status: 200 });
    }),

    // Get Employer Requests for a Workplace
    http.get(`${API_BASE_URL}/workplace/:id/employers/request`, async ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || 0);
        const size = Number(url.searchParams.get('size') || 10);

        // Return empty list by default (no pending requests)
        return HttpResponse.json({
            content: [],
            page,
            size,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
        }, { status: 200 });
    }),

    // Get My Employer Requests
    http.get(`${API_BASE_URL}/workplace/employers/requests/me`, async ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || 0);
        const size = Number(url.searchParams.get('size') || 10);

        // Return empty list by default
        return HttpResponse.json({
            content: [],
            page,
            size,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
        }, { status: 200 });
    }),

    // Get Workplace Reviews
    http.get(`${API_BASE_URL}/workplace/:id/review`, async ({ params, request }) => {
        const { id } = params;
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || 0);
        const size = Number(url.searchParams.get('size') || 10);

        const mockReviews = [
            {
                id: 101,
                workplaceId: Number(id),
                userId: 5,
                username: 'user5',
                title: 'Great place to work',
                content: 'I learned a lot here.',
                anonymous: false,
                helpfulCount: 5,
                overallRating: 5,
                ethicalPolicyRatings: { 'Sustainability': 5 },
                createdAt: '2024-01-10',
                updatedAt: '2024-01-10'
            },
            {
                id: 102,
                workplaceId: Number(id),
                userId: 6,
                username: 'user6',
                title: 'Excellent workplace',
                content: 'Very ethical company.',
                anonymous: false,
                helpfulCount: 3,
                overallRating: 4,
                ethicalPolicyRatings: { 'Diversity': 4 },
                createdAt: '2024-01-09',
                updatedAt: '2024-01-09'
            }
        ];

        const totalElements = mockReviews.length;
        const totalPages = Math.ceil(totalElements / size);
        const content = mockReviews.slice(page * size, (page + 1) * size);

        return HttpResponse.json({
            content,
            page,
            size,
            totalElements,
            totalPages,
            hasNext: page < totalPages - 1,
            hasPrevious: page > 0
        }, { status: 200 });
    })
];
