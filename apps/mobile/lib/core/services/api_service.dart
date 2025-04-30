import '../models/job_post.dart'; // Adjust path if needed
import 'package:http/http.dart' as http;
import 'dart:convert'; // Needed for actual API call example

// Define ethical policies and job types (could come from API later)
const List<String> _availableEthicalPolicies = [
  'fair_wage',
  'diversity',
  'sustainability',
  'wellbeing',
  'transparency',
];
const List<String> _availableJobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
];

/// Placeholder service for API interactions.
/// Replace with actual HTTP calls to your backend.
class ApiService {
  // Expose available filters
  List<String> get availableEthicalPolicies => _availableEthicalPolicies;
  List<String> get availableJobTypes => _availableJobTypes;

  /// Fetches job postings based on query and filters.
  Future<List<JobPost>> fetchJobPostings({
    String? query,
    Map<String, List<String>>? filters, // Changed to Map
  }) async {
    print('API: Fetching job postings (query: $query, filters: $filters)');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    final List<String>? policyFilters = filters?['policies'];
    final List<String>? jobTypeFilters = filters?['jobTypes'];

    // --- Placeholder Data --- (Replace with actual API call)
    final List<JobPost> allJobs = [
      JobPost(
        id: '1',
        title: 'Software Engineer',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 2)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$80k - \$100k',
        contactInfo: 'hr@ethical.com',
      ),
      JobPost(
        id: '2',
        title: 'UX Designer',
        company: 'Green Tech',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 5)),
        ethicalPolicies: ['sustainability', 'wellbeing'],
        salaryRange: '\$70k - \$90k',
        contactInfo: 'careers@green.tech',
      ),
      JobPost(
        id: '3',
        title: 'Data Analyst',
        company: 'Fair Solutions',
        jobType: 'Part-time',
        datePosted: DateTime.now().subtract(const Duration(days: 1)),
        ethicalPolicies: ['fair_wage'],
        contactInfo: 'jobs@fair.co',
      ),
      JobPost(
        id: '4',
        title: 'Marketing Specialist',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(hours: 10)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$60k - \$75k',
        contactInfo: 'hr@ethical.com',
      ),
      JobPost(
        id: '5',
        title: 'Project Manager',
        company: 'Green Tech',
        jobType: 'Contract',
        datePosted: DateTime.now().subtract(const Duration(days: 7)),
        ethicalPolicies: ['sustainability'],
        contactInfo: 'pm@green.tech',
      ),
      JobPost(
        id: '6',
        title: 'Frontend Intern',
        company: 'Fair Solutions',
        jobType: 'Internship',
        datePosted: DateTime.now().subtract(const Duration(days: 3)),
        ethicalPolicies: ['fair_wage', 'transparency'],
        contactInfo: 'intern@fair.co',
      ),
    ];

    // Simulate filtering/searching
    List<JobPost> filteredJobs = allJobs;
    if (query != null && query.isNotEmpty) {
      filteredJobs =
          filteredJobs
              .where(
                (job) =>
                    job.title.toLowerCase().contains(query.toLowerCase()) ||
                    job.company.toLowerCase().contains(query.toLowerCase()),
              )
              .toList();
    }
    // Filter by ethical policies
    if (policyFilters != null && policyFilters.isNotEmpty) {
      filteredJobs =
          filteredJobs
              .where(
                (job) => policyFilters.every(
                  (filter) => job.ethicalPolicies.contains(filter),
                ),
              )
              .toList();
    }
    // Filter by job type
    if (jobTypeFilters != null && jobTypeFilters.isNotEmpty) {
      filteredJobs =
          filteredJobs
              .where((job) => jobTypeFilters.contains(job.jobType))
              .toList();
    }

    // Simulate potential API error
    // if (query == 'error') { throw Exception('Failed to fetch jobs from API'); }

    return filteredJobs;
    // --- End Placeholder Data ---

    /* --- Actual API Call Example (using http package) ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/jobs');
    final queryParams = <String, dynamic>{}; // Use dynamic for list values
    if (query != null) queryParams['search'] = query;
    if (policyFilters != null && policyFilters.isNotEmpty) queryParams['policies'] = policyFilters; // Pass list directly
    if (jobTypeFilters != null && jobTypeFilters.isNotEmpty) queryParams['jobTypes'] = jobTypeFilters; // Pass list directly

    // Adjust URI encoding based on how your backend expects list parameters
    // Example: using Uri.https with queryParametersAll for lists
    // final finalUri = Uri.https('your.api.domain', '/jobs', queryParams);
    final finalUri = uri.replace(queryParameters: queryParams.map((k, v) => MapEntry(k, v.toString()))); // Simple toString, backend needs to parse

    try {
      final response = await http.get(finalUri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => JobPost.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load jobs: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching jobs: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Fetches job postings created by a specific employer.
  Future<List<JobPost>> fetchEmployerJobPostings(String employerId) async {
    print('API: Fetching job postings for employer $employerId');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    // --- Placeholder Data --- (Replace with actual API call)
    List<JobPost> employerJobs = [
      JobPost(
        id: '1',
        title: 'Software Engineer',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 2)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$80k - \$100k',
        contactInfo: 'hr@ethical.com',
      ),
      JobPost(
        id: '4',
        title: 'Marketing Specialist',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(hours: 10)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$60k - \$75k',
        contactInfo: 'hr@ethical.com',
      ),
    ];
    // Filter just in case (though API should do this)
    // employerJobs = employerJobs.where((job) => job.employerId == employerId).toList();
    return employerJobs;
    // --- End Placeholder Data ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/employers/$employerId/jobs');
    try {
      final response = await http.get(uri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => JobPost.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load employer jobs: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching employer jobs: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  // TODO: Add other API methods as needed (createJobPost, applyToJob, getJobDetails, etc.)
}
