import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/providers/auth_provider.dart';
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
  List<String> _availableTags = ['Ethics', 'Contracts', 'Career Advice', 'Benefits', 'General'];
  bool _tagError = false;

  @override
  void initState() {
    super.initState();
    _titleCtrl = TextEditingController(text: widget.thread?.title ?? '');
    _bodyCtrl = TextEditingController(text: widget.thread?.body ?? '');
    if (widget.thread != null) {
      _selectedTags = List<String>.from(widget.thread!.tags);
    }
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    ApiService(authProvider: authProvider).fetchDiscussionTags().then((tags) {
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
              /// Title
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: TextFormField(
                    controller: _titleCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Title',
                      border: OutlineInputBorder(),
                    ),
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
                ),
              ),
              const SizedBox(height: 12),

              /// Body
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: TextFormField(
                      controller: _bodyCtrl,
                      decoration: const InputDecoration(
                        labelText: 'What’s on your mind?',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: null,
                      expands: true,
                      validator: (value) =>
                      (value == null || value.trim().isEmpty)
                          ? 'Please enter content'
                          : null,
                    ),
                  ),
                ),
              ),

              /// Tags
              Card(
                margin: const EdgeInsets.only(top: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tags', style: Theme.of(context).textTheme.bodyLarge),
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
                      if (_tagError)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
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

              /// Submit Button
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: ElevatedButton(
                  onPressed: () async {
                    final navigator = Navigator.of(context);
                    final valid = _formKey.currentState!.validate();
                    setState(() => _tagError = _selectedTags.isEmpty);
                    if (!valid || _tagError) return;

                    final authProvider = context.read<AuthProvider>();
                    final api = ApiService(authProvider: authProvider);
                    try {
                      final DiscussionThread saved = isEditing
                          ? await api.editDiscussion(
                        widget.thread!.id,
                        _titleCtrl.text.trim(),
                        _bodyCtrl.text.trim(),
                        _selectedTags,
                      )
                          : await api.createDiscussionThread(
                        _titleCtrl.text.trim(),
                        _bodyCtrl.text.trim(),
                        _selectedTags,
                      );
                      if (!mounted) return;
                      navigator.pop(saved);
                    } on SocketException {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Failed to create/edit discussion. Please check your connection.", style: TextStyle(color: Colors.red))),
                      );
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Failed to create/edit discussion.", style: TextStyle(color: Colors.red))),
                      );
                    }
                  },
                  child: Text(isEditing ? 'Save' : 'Post'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}