import 'package:flutter/material.dart';
import '../../../generated/l10n/app_localizations.dart';

class Company {
  final String name;
  final String industry;
  final String location;
  final double averageRating;
  final int reviewCount;

  Company({
    required this.name,
    required this.industry,
    required this.location,
    required this.averageRating,
    required this.reviewCount,
  });
}

final List<Company> mockCompanies = [
  Company(
    name: 'EcoTech Solutions',
    industry: 'Technology • Software',
    location: 'San Francisco, CA (Remote-Friendly)',
    averageRating: 4.8,
    reviewCount: 127,
  ),
  Company(
    name: 'GreenFoods Inc.',
    industry: 'Food & Beverage',
    location: 'Austin, TX',
    averageRating: 4.5,
    reviewCount: 89,
  ),
  Company(
    name: 'HealthFirst',
    industry: 'Healthcare',
    location: 'New York, NY',
    averageRating: 4.2,
    reviewCount: 54,
  ),
  Company(
    name: 'EduFuture',
    industry: 'Education',
    location: 'Remote',
    averageRating: 4.9,
    reviewCount: 33,
  ),
  Company(
    name: 'BuildRight',
    industry: 'Construction',
    location: 'Denver, CO',
    averageRating: 4.0,
    reviewCount: 21,
  ),
];

class WorkplacesPage extends StatelessWidget {
  const WorkplacesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.workplaces_title),
        automaticallyImplyLeading: false,
      ),
      body: ListView.builder(
        itemCount: mockCompanies.length,
        itemBuilder: (context, index) {
          final company = mockCompanies[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ListTile(
              title: Text(company.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(company.industry),
                  Text(company.location, style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.star, color: Colors.amber, size: 18),
                      Text(
                        company.averageRating.toStringAsFixed(1),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(' (${AppLocalizations.of(context)!.workplaces_reviews(company.reviewCount)})', style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ],
              ),
              onTap: () {
                // TODO: Navigate to company profile page
              },
            ),
          );
        },
      ),
    );
  }
}
