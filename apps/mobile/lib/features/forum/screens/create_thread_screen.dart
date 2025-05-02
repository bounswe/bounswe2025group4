import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/discussion_thread.dart';

class CreateThreadScreen extends StatefulWidget {
  final DiscussionThread? thread;
  const CreateThreadScreen({super.key, this.thread});

  @override
  State<CreateThreadScreen> createState() => _CreateThreadScreenState();
}

class _CreateThreadScreenState extends State<CreateThreadScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleCtrl;
  late TextEditingController _bodyCtrl;
  List<String> _selectedTags = [];
  List<String> _availableTags = [];
  bool _tagError = false;

  @override
  void initState() {
    super.initState();
    // Initialize controllers with existing data if editing
    _titleCtrl = TextEditingController(text: widget.thread?.title ?? '');
    _bodyCtrl  = TextEditingController(text: widget.thread?.body  ?? '');
    _selectedTags = widget.thread?.tags.toList() ?? [];

    // Load tags from the API stub
    ApiService().fetchDiscussionTags().then((tags) {
      setState(() {
        _availableTags = tags;
      });
    });
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _bodyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.thread != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Discussion' : 'New Discussion'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Title
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(hintText: 'Title'),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a title';
                  }
                  if (value.trim().length > 100) {
                    return 'Title must be at most 100 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),

              // Body
              Expanded(
                child: TextFormField(
                  controller: _bodyCtrl,
                  decoration:
                  const InputDecoration(hintText: 'What’s on your mind?'),
                  maxLines: null,
                  expands: true,
                  validator: (value) =>
                  (value == null || value.trim().isEmpty)
                      ? 'Please enter content'
                      : null,
                ),
              ),
              const SizedBox(height: 12),

              // Tags
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Tags', style: Theme.of(context).textTheme.bodyLarge),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _availableTags.map((tag) {
                  final selected = _selectedTags.contains(tag);
                  return ChoiceChip(
                    label: Text(tag),
                    selected: selected,
                    onSelected: (on) {
                      setState(() {
                        if (on) {
                          _selectedTags.add(tag);
                        } else {
                          _selectedTags.remove(tag);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Submit button
              ElevatedButton(
                onPressed: () async {
                  final navigator = Navigator.of(context);
                  final valid = _formKey.currentState!.validate();
                  setState(() => _tagError = _selectedTags.isEmpty);
                  if (!valid || _tagError) return;

                  final api = ApiService();
                  final title = _titleCtrl.text.trim();
                  final body  = _bodyCtrl.text.trim();
                  DiscussionThread saved;

                  if (isEditing) {
                    saved = await api.editDiscussion(
                      widget.thread!.id, title, body, _selectedTags);
                  } else {
                    saved = await api.createDiscussionThread(
                      title, body, _selectedTags);
                  }

                  if (!mounted) return;
                  navigator.pop(saved);
                },
                child: Text(isEditing ? 'Save' : 'Post'),
              ),

              // Tag error
              if (_tagError)
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Please select at least one topic',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                      fontSize: 12,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}