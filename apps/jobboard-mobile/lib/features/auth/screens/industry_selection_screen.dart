import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/mentorship_selection_screen.dart';
import 'package:mobile/features/auth/screens/sign_up_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

class IndustrySelectionScreen extends StatefulWidget {
  const IndustrySelectionScreen({super.key});

  @override
  State<IndustrySelectionScreen> createState() =>
      _IndustrySelectionScreenState();
}

class _IndustrySelectionScreenState extends State<IndustrySelectionScreen> {
  final Set<String> selectedIndustries = {};
  final TextEditingController _otherController = TextEditingController();
  bool showOtherField = false;

  List<String> _getIndustries(BuildContext context) {
    return [
      AppLocalizations.of(context)!.industrySelectionScreen_tech,
      AppLocalizations.of(context)!.industrySelectionScreen_healthcare,
      AppLocalizations.of(context)!.industrySelectionScreen_education,
      AppLocalizations.of(context)!.industrySelectionScreen_finance,
      AppLocalizations.of(context)!.industrySelectionScreen_creativeArts,
      AppLocalizations.of(context)!.organizationTypeScreen_other,
    ];
  }

  @override
  void dispose() {
    _otherController.dispose();
    super.dispose();
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
            const OnboardingProgressBar(currentStep: 3, totalSteps: 4),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.industrySelectionScreen_question,
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
                        itemCount: _getIndustries(context).length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final industry = _getIndustries(context)[index];
                          final isSelected = selectedIndustries.contains(
                            industry,
                          );
                          final isOther = industry == AppLocalizations.of(context)!.organizationTypeScreen_other;

                          return Column(
                            children: [
                              InkWell(
                                onTap: () {
                                  setState(() {
                                    if (isSelected) {
                                      selectedIndustries.remove(industry);
                                      if (isOther) {
                                        showOtherField = false;
                                        _otherController.clear();
                                      }
                                    } else {
                                      selectedIndustries.add(industry);
                                      if (isOther) {
                                        showOtherField = true;
                                      }
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
                                        child: Text(
                                          industry,
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight:
                                                isSelected
                                                    ? FontWeight.bold
                                                    : FontWeight.normal,
                                          ),
                                        ),
                                      ),
                                      if (isSelected)
                                        const Icon(
                                          Icons.check_circle,
                                          color: Colors.blue,
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                              if (isOther && showOtherField)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: TextField(
                                    controller: _otherController,
                                    decoration: InputDecoration(
                                      hintText: AppLocalizations.of(context)!.organizationTypeScreen_pleaseSpecify,
                                      border: const OutlineInputBorder(),
                                      contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 12,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
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
                            selectedIndustries.isNotEmpty
                                ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) =>
                                              const MentorshipSelectionScreen(
                                                isJobSeeker: true,
                                              ),
                                    ),
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
