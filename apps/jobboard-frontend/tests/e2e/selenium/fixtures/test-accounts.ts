/**
 * Test Account Fixtures
 *
 * Defines test user accounts for E2E testing.
 * These accounts should exist in your dev/test database.
 */

import { config } from '../config/test.config.ts';

export interface TestAccount {
  email: string;
  password: string;
  role: 'employer' | 'employee';
}

/**
 * Employer test account
 */
export const employerAccount: TestAccount = {
  email: config.employer.username,
  password: config.employer.password,
  role: 'employer',
};

/**
 * Employee test account
 */
export const employeeAccount: TestAccount = {
  email: config.employee.username,
  password: config.employee.password,
  role: 'employee',
};

/**
 * Get test account by role
 */
export function getTestAccount(role: 'employer' | 'employee'): TestAccount {
  return role === 'employer' ? employerAccount : employeeAccount;
}
