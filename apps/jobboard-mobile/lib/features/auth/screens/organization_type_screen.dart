import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/company_policies_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

class OrganizationTypeScreen extends StatefulWidget {
  const OrganizationTypeScreen({super.key});

  @override
  State<OrganizationTypeScreen> createState() => _OrganizationTypeScreenState();
}

class _OrganizationTypeScreenState extends State<OrganizationTypeScreen> {
  String? selectedType;
  final TextEditingController _otherController = TextEditingController();
  bool showOtherField = false;

  List<String> _getOrganizationTypes(BuildContext context) {
    return [
      AppLocalizations.of(context)!.organizationTypeScreen_company,
      AppLocalizations.of(context)!.organizationTypeScreen_startup,
      AppLocalizations.of(context)!.organizationTypeScreen_nonprofit,
      AppLocalizations.of(context)!.organizationTypeScreen_freelancer,
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
            const OnboardingProgressBar(currentStep: 1, totalSteps: 3),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.organizationTypeScreen_question,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Expanded(
                      child: ListView.separated(
                        itemCount: _getOrganizationTypes(context).length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final type = _getOrganizationTypes(context)[index];
                          final isSelected = selectedType == type;
                          final isOther = type == AppLocalizations.of(context)!.organizationTypeScreen_other;

                          return Column(
                            children: [
                              InkWell(
                                onTap: () {
                                  setState(() {
                                    if (isSelected) {
                                      selectedType = null;
                                      if (isOther) {
                                        showOtherField = false;
                                        _otherController.clear();
                                      }
                                    } else {
                                      selectedType = type;
                                      if (isOther) {
                                        showOtherField = true;
                                      } else {
                                        showOtherField = false;
                                        _otherController.clear();
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
                                          type,
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
                            selectedType != null &&
                                    (!showOtherField ||
                                        _otherController.text.isNotEmpty)
                                ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) =>
                                              const CompanyPoliciesScreen(),
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
