// lib/core/utils/string_extensions.dart

import 'package:flutter/material.dart';
import '../../generated/l10n/app_localizations.dart';

extension StringExtension on String {
  /// Capitalizes the first letter of the string.
  String capitalizeFirst() {
    if (isEmpty) return "";
    return "${this[0].toUpperCase()}${substring(1)}";
  }

  /// Formats a snake_case or similar string for display
  /// (e.g., 'fair_wage' -> 'Fair wage').
  String formatFilterName() {
    return replaceAll('_', ' ').capitalizeFirst();
  }

  /// Returns the localized name for ethical policies.
  /// Falls back to formatFilterName() if no localization is found.
  String formatLocalizedEthicalPolicy(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    // Map ethical policy keys to their localized values
    switch (this) {
      case 'salary_transparency':
        return l10n.ethicalPolicy_salary_transparency;
      case 'equal_pay_policy':
        return l10n.ethicalPolicy_equal_pay_policy;
      case 'living_wage_employer':
        return l10n.ethicalPolicy_living_wage_employer;
      case 'comprehensive_health_insurance':
        return l10n.ethicalPolicy_comprehensive_health_insurance;
      case 'performance_based_bonus':
        return l10n.ethicalPolicy_performance_based_bonus;
      case 'retirement_plan_support':
        return l10n.ethicalPolicy_retirement_plan_support;
      case 'flexible_hours':
        return l10n.ethicalPolicy_flexible_hours;
      case 'remote_friendly':
        return l10n.ethicalPolicy_remote_friendly;
      case 'no_after_hours_work_culture':
        return l10n.ethicalPolicy_no_after_hours_work_culture;
      case 'mental_health_support':
        return l10n.ethicalPolicy_mental_health_support;
      case 'generous_paid_time_off':
        return l10n.ethicalPolicy_generous_paid_time_off;
      case 'paid_parental_leave':
        return l10n.ethicalPolicy_paid_parental_leave;
      case 'inclusive_hiring_practices':
        return l10n.ethicalPolicy_inclusive_hiring_practices;
      case 'diverse_leadership':
        return l10n.ethicalPolicy_diverse_leadership;
      case 'lgbtq_friendly_workplace':
        return l10n.ethicalPolicy_lgbtq_friendly_workplace;
      case 'disability_inclusive_workplace':
        return l10n.ethicalPolicy_disability_inclusive_workplace;
      case 'supports_women_in_leadership':
        return l10n.ethicalPolicy_supports_women_in_leadership;
      case 'mentorship_program':
        return l10n.ethicalPolicy_mentorship_program;
      case 'learning_development_budget':
        return l10n.ethicalPolicy_learning_development_budget;
      case 'transparent_promotion_paths':
        return l10n.ethicalPolicy_transparent_promotion_paths;
      case 'internal_mobility':
        return l10n.ethicalPolicy_internal_mobility;
      case 'sustainability_focused':
        return l10n.ethicalPolicy_sustainability_focused;
      case 'ethical_supply_chain':
        return l10n.ethicalPolicy_ethical_supply_chain;
      case 'community_volunteering':
        return l10n.ethicalPolicy_community_volunteering;
      case 'certified_b_corporation':
        return l10n.ethicalPolicy_certified_b_corporation;
      default:
        // Fallback to the formatted name if not found
        return formatFilterName();
    }
  }
}
