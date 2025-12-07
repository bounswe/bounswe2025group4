import { type EthicalTag, type EthicalTagCategory } from '@shared/types/job';

/**
 * Maps ethical tags to their i18n translation keys
 */
export const TAG_TO_KEY_MAP: Record<EthicalTag, string> = {
  'Salary Transparency': 'salaryTransparency',
  'Equal Pay Policy': 'equalPayPolicy',
  'Living Wage Employer': 'livingWageEmployer',
  'Comprehensive Health Insurance': 'comprehensiveHealthInsurance',
  'Performance-Based Bonus': 'performanceBasedBonus',
  'Retirement Plan Support': 'retirementPlanSupport',
  'Paid Parental Leave': 'paidParentalLeave',
  'Flexible Hours': 'flexibleHours',
  'Remote-Friendly': 'remoteFriendly',
  'No After-Hours Work Culture': 'noAfterHoursWorkCulture',
  'Mental Health Support': 'mentalHealthSupport',
  'Generous Paid Time Off': 'generousPaidTimeOff',
  'Inclusive Hiring Practices': 'inclusiveHiringPractices',
  'Diverse Leadership': 'diverseLeadership',
  'LGBTQ+ Friendly Workplace': 'lgbtqFriendlyWorkplace',
  'Disability-Inclusive Workplace': 'disabilityInclusiveWorkplace',
  'Supports Women in Leadership': 'supportsWomenInLeadership',
  'Mentorship Program': 'mentorshipProgram',
  'Learning & Development Budget': 'learningDevelopmentBudget',
  'Transparent Promotion Paths': 'transparentPromotionPaths',
  'Internal Mobility': 'internalMobility',
  'Sustainability-Focused': 'sustainabilityFocused',
  'Ethical Supply Chain': 'ethicalSupplyChain',
  'Community Volunteering': 'communityVolunteering',
  'Certified B-Corporation': 'certifiedBCorporation',
};

/**
 * Maps ethical tag categories to their i18n translation keys
 */
export const CATEGORY_TO_KEY_MAP: Record<EthicalTagCategory, string> = {
  'Compensation & Benefits': 'compensationAndBenefits',
  'Work-Life Balance': 'workLifeBalance',
  'Diversity & Inclusion': 'diversityAndInclusion',
  'Career Development': 'careerDevelopment',
  'Environmental & Social Impact': 'environmentalAndSocialImpact',
};

/**
 * Flat array of all ethical tags for easier iteration
 */
export const ETHICAL_TAGS: EthicalTag[] = Object.keys(TAG_TO_KEY_MAP) as EthicalTag[];
