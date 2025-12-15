import type { RouteObject } from 'react-router-dom';

import { homeRoutes } from './home/routes.tsx';
import { authRoutes } from './auth/routes';
import { jobsRoutes } from './jobs/routes';
import { volunteeringRoutes } from './volunteering/routes';
import { applicationsRoutes } from './jobs/applications/routes';
import { employerRoutes } from './employer/routes';
import { workplaceRoutes } from './workplace/routes';
import { mentorshipRoutes } from './mentorship/routes';
import { forumRoutes } from './forum/routes';
import { profileRoutes } from './profile/routes';
import { adminRoutes } from './admin/routes';

export const featureRoutes: RouteObject[] = [
  ...homeRoutes,
  ...jobsRoutes,
  ...volunteeringRoutes,
  ...applicationsRoutes,
  ...employerRoutes,
  ...workplaceRoutes,
  ...mentorshipRoutes,
  ...forumRoutes,
  ...profileRoutes,
  ...adminRoutes,
  ...authRoutes,
];

