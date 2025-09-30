import 'package:flutter/material.dart';
import '../../../core/models/education.dart';
import 'package:intl/intl.dart';

class EducationItem extends StatelessWidget {
  final Education education;
  final bool isEditable;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const EducationItem({
    Key? key,
    required this.education,
    this.isEditable = false,
    this.onEdit,
    this.onDelete,
  }) : super(key: key);

  String _formatDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) return 'Present';
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('MMM yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        education.school,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${education.degree} in ${education.field}',
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_formatDate(education.startDate)} - ${_formatDate(education.endDate)}',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isEditable)
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit, size: 20),
                        onPressed: onEdit,
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                        onPressed: onDelete,
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
