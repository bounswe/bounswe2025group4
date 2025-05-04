// API functions for Job Listing features
import {
  Job,
  JobFilters,
  JobListResponse,
  ApplicationData,
} from '../types/job';

// Assume API base URL is configured elsewhere (e.g., via environment variables)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'; // Example

// Helper function to handle API requests
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  // TODO: Add Authorization header using token from AuthContext if required
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // TODO: Implement more robust error handling (e.g., parse error response body)
    throw new Error(`API request failed: ${response.statusText}`);
  }

  // Handle cases where the response might be empty (e.g., 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches a list of jobs based on provided filters.
 */
export const fetchJobs = async (
  filters: JobFilters
): Promise<JobListResponse> => {
  const queryParams = new URLSearchParams();

  // Append filters to query parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => queryParams.append(key, item));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  // Default page and limit if not provided
  if (!filters.page) queryParams.set('page', '1');
  if (!filters.limit) queryParams.set('limit', '10');

  const url = `${API_BASE_URL}/jobs?${queryParams.toString()}`;
  console.log('Fetching jobs from:', url); // Debugging
  return fetchApi<JobListResponse>(url);
};

/**
 * Fetches details for a single job by its ID.
 */
export const fetchJobById = async (jobId: string): Promise<Job> => {
  const url = `${API_BASE_URL}/jobs/${jobId}`;
  console.log('Fetching job details from:', url); // Debugging
  return fetchApi<Job>(url);
};

/**
 * Submits a job application.
 */
export const submitApplication = async (
  jobId: string,
  applicationData: ApplicationData
): Promise<void> => {
  const url = `${API_BASE_URL}/jobs/${jobId}/apply`; // Or /applications
  console.log('Submitting application to:', url); // Debugging

  // If sending files, use FormData instead of JSON
  // const formData = new FormData();
  // formData.append('coverLetter', applicationData.coverLetter);
  // if (applicationData.resumeFile) {
  //   formData.append('resume', applicationData.resumeFile);
  // }
  // await fetchApi<void>(url, {
  //   method: 'POST',
  //   body: formData,
  //   headers: { /* Remove 'Content-Type': 'application/json' */ }
  // });

  await fetchApi<void>(url, {
    method: 'POST',
    body: JSON.stringify(applicationData),
  });
};
