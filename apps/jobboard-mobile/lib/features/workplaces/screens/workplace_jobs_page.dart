import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/job_post.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../job/screens/job_details_screen.dart';
import 'package:intl/intl.dart';

class WorkplaceJobsPage extends StatefulWidget {
  final int workplaceId;
  final String workplaceName;

  const WorkplaceJobsPage({
    super.key,
    required this.workplaceId,
    required this.workplaceName,
  });

  @override
  State<WorkplaceJobsPage> createState() => _WorkplaceJobsPageState();
}

class _WorkplaceJobsPageState extends State<WorkplaceJobsPage> {
  late ApiService _apiService;
  List<JobPost> _jobs = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadJobs();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _apiService = ApiService(authProvider: authProvider);
  }

  Future<void> _loadJobs() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final jobs = await _apiService.getJobsByWorkplaceId(widget.workplaceId);
      setState(() {
        _jobs = jobs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    try {
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (e) {
      return 'N/A';
    }
  }

  String _formatSalary(int? minSalary, int? maxSalary) {
    if (minSalary == null && maxSalary == null) return 'Not specified';
    if (minSalary != null && maxSalary != null) {
      return '\$${minSalary.toString()} - \$${maxSalary.toString()}';
    }
    if (minSalary != null) return '\$${minSalary.toString()}+';
    return 'Up to \$${maxSalary.toString()}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Jobs at ${widget.workplaceName}')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 48,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.red),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadJobs,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
              : _jobs.isEmpty
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.work_outline,
                      size: 64,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No jobs available at ${widget.workplaceName}',
                      style: const TextStyle(fontSize: 18),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
              : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _jobs.length,
                itemBuilder: (context, index) {
                  final job = _jobs[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder:
                                (context) => JobDetailsScreen(jobId: job.id),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Job Title
                            Text(
                              job.title,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Salary
                            Row(
                              children: [
                                const Icon(
                                  Icons.attach_money,
                                  size: 16,
                                  color: Colors.green,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  _formatSalary(job.minSalary, job.maxSalary),
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[700],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Tags (Remote, Inclusive)
                            Wrap(
                              spacing: 8,
                              runSpacing: 4,
                              children: [
                                if (job.remote)
                                  Chip(
                                    label: const Text('Remote'),
                                    avatar: const Icon(
                                      Icons.home_work,
                                      size: 16,
                                    ),
                                    backgroundColor: Colors.blue.withOpacity(
                                      0.1,
                                    ),
                                    labelStyle: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.blue,
                                    ),
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                    ),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                if (job.inclusiveOpportunity)
                                  Chip(
                                    label: const Text('Inclusive'),
                                    avatar: const Icon(
                                      Icons.accessibility_new,
                                      size: 16,
                                    ),
                                    backgroundColor: Colors.purple.withOpacity(
                                      0.1,
                                    ),
                                    labelStyle: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.purple,
                                    ),
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                    ),
                                    visualDensity: VisualDensity.compact,
                                  ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Description preview
                            if (job.description.isNotEmpty)
                              Text(
                                job.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                              ),
                            const SizedBox(height: 8),

                            // Posted date
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.calendar_today,
                                      size: 14,
                                      color: Colors.grey[500],
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Posted: ${_formatDate(job.postedDate)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[500],
                                      ),
                                    ),
                                  ],
                                ),
                                const Icon(
                                  Icons.chevron_right,
                                  color: Colors.grey,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
    );
  }
}
