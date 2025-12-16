/**
 * Auth Service
 * Handles authentication-related API calls
 */

import { api } from '@shared/lib/api-client';
import type { ApiMessage } from '@shared/types/workplace.types';

const BASE_PATH = '/auth';

/**
 * Delete the current user's account
 * DELETE /api/auth/me
 */
export async function deleteAccount(): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(`${BASE_PATH}/me`);
  return response.data;
}

