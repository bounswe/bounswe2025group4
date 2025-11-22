import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/mentorship_selection_screen.dart';
import 'package:mobile/features/auth/screens/sign_up_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import '../../../core/widgets/a11y.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

class CompanyPoliciesScreen extends StatefulWidget {
  const CompanyPoliciesScreen({super.key});

  @override
  State<CompanyPoliciesScreen> createState() => _CompanyPoliciesScreenState();
}

class _CompanyPoliciesScreenState extends State<CompanyPoliciesScreen> {
  final Set<String> selectedPolicies = {};

  List<CompanyPolicy> _getCompanyPolicies(BuildContext context) {
    return [
      CompanyPolicy(
        title: AppLocalizations.of(context)!.companyPoliciesScreen_fairWage,
        description: AppLocalizations.of(context)!.companyPoliciesScreen_fairWageDesc,
      ),
      CompanyPolicy(
        title: AppLocalizations.of(context)!.companyPoliciesScreen_diversity,
        description: AppLocalizations.of(context)!.companyPoliciesScreen_diversityDesc,
      ),
      CompanyPolicy(
        title: AppLocalizations.of(context)!.companyPoliciesScreen_wellbeing,
        description: AppLocalizations.of(context)!.companyPoliciesScreen_wellbeingDesc,
      ),
      CompanyPolicy(
        title: AppLocalizations.of(context)!.companyPoliciesScreen_remotePolicy,
        description: AppLocalizations.of(context)!.companyPoliciesScreen_remotePolicyDesc,
      ),
      CompanyPolicy(
        title: AppLocalizations.of(context)!.companyPoliciesScreen_sustainabilityPolicy,
        description: AppLocalizations.of(context)!.companyPoliciesScreen_sustainabilityPolicyDesc,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: AppLocalizations.of(context)!.common_back,
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const OnboardingProgressBar(currentStep: 2, totalSteps: 3),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.companyPoliciesScreen_question,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppLocalizations.of(context)!.jobPrioritiesScreen_selectAll,
                      style: const TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    Expanded(
                      child: ListView.separated(
                        itemCount: _getCompanyPolicies(context).length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final policy = _getCompanyPolicies(context)[index];
                          final isSelected = selectedPolicies.contains(
                            policy.title,
                          );

                          return InkWell(
                            onTap: () {
                              setState(() {
                                if (isSelected) {
                                  selectedPolicies.remove(policy.title);
                                } else {
                                  selectedPolicies.add(policy.title);
                                }
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color:
                                      isSelected
                                          ? Colors.blue
                                          : Colors.grey.shade300,
                                ),
                                borderRadius: BorderRadius.circular(8),
                                color:
                                    isSelected
                                        ? Colors.blue.withOpacity(0.1)
                                        : null,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          policy.title,
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight:
                                                isSelected
                                                    ? FontWeight.bold
                                                    : FontWeight.normal,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          policy.description,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (isSelected)
                                    const A11y(
                                      label: 'Selected',
                                      child: Icon(
                                        Icons.check_circle,
                                        color: Colors.blue,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed:
                            selectedPolicies.isNotEmpty
                                ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const SignUpScreen(),
                                    )
                                  );
                                }
                                : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          AppLocalizations.of(context)!.userTypeScreen_continue,
                          style: const TextStyle(color: Colors.white, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CompanyPolicy {
  final String title;
  final String description;

  const CompanyPolicy({required this.title, required this.description});
}
