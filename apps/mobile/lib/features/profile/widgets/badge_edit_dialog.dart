import 'package:flutter/material.dart';
import '../../../core/models/user.dart';

class BadgeEditDialog extends StatefulWidget {
  final List<UserBadge> badges;
  const BadgeEditDialog({super.key, required this.badges});

  @override
  State<BadgeEditDialog> createState() => _BadgeEditDialogState();
}

class _BadgeEditDialogState extends State<BadgeEditDialog> {
  late List<UserBadge> _badges;
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _iconController = TextEditingController();
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _badges = List<UserBadge>.from(widget.badges);
  }

  void _addBadge() {
    if (_nameController.text.trim().isEmpty ||
        _descController.text.trim().isEmpty ||
        _iconController.text.trim().isEmpty) {
      setState(() { _errorText = 'Please fill all fields.'; });
      return;
    }
    setState(() {
      _badges.add(UserBadge(
        name: _nameController.text.trim(),
        description: _descController.text.trim(),
        icon: _iconController.text.trim(),
        earnedAt: DateTime.now(),
      ));
      _nameController.clear();
      _descController.clear();
      _iconController.clear();
      _errorText = null;
    });
  }

  void _removeBadge(int index) {
    setState(() {
      _badges.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Badges'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_badges.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Text('No badges yet.'),
              ),
            if (_badges.isNotEmpty)
              ..._badges.asMap().entries.map((entry) => ListTile(
                    leading: Icon(IconData(int.tryParse(entry.value.icon) ?? 0xe123, fontFamily: 'MaterialIcons')),
                    title: Text(entry.value.name),
                    subtitle: Text(entry.value.description),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      tooltip: 'Delete',
                      onPressed: () => _removeBadge(entry.key),
                    ),
                  )),
            const Divider(),
            const SizedBox(height: 8),
            Text('Add New Badge', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Badge Name'),
            ),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
            TextField(
              controller: _iconController,
              decoration: const InputDecoration(labelText: 'Icon Code (e.g. 0xe123)'),
            ),
            if (_errorText != null) ...[
              const SizedBox(height: 8),
              Text(_errorText!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 8),
            ElevatedButton.icon(
              icon: const Icon(Icons.add),
              label: const Text('Add Badge'),
              onPressed: _addBadge,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, _badges),
          child: const Text('Save'),
        ),
      ],
    );
  }
} 