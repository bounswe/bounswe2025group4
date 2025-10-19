import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/discussion_thread.dart';
import '../../../core/services/tag_recommendation_service.dart';
import '../../../generated/l10n/app_localizations.dart';

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
  final TextEditingController _newTagCtrl = TextEditingController();
  List<String> _selectedTags = [];
  List<String> _availableTags = [];
  String? _tagError;

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
    _newTagCtrl.dispose();
    super.dispose();
  }

  void _showTagSelectionSheet() {
    final List<String> tempSelectedTags = List.from(_selectedTags);
    String _searchQuery = '';
    List<String> _suggestedTags = [];
    String? _suggestError;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.75),
      builder: (_) {
        final TextEditingController _modalTagController = TextEditingController();

        return Padding(
          padding: MediaQuery.of(context).viewInsets,
          child: StatefulBuilder(
            builder: (context, setModalState) {
              return Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ElevatedButton(
                      onPressed: () async {
                        HapticFeedback.lightImpact();
                        final title = _titleCtrl.text.trim();
                        if (title.isEmpty) {
                          setModalState(() {
                            _suggestError = AppLocalizations.of(context)!.createThread_enterTitleForSuggestions;
                          });
                          return;
                        }
                        final result = await TagRecommendationService.fetchSuggestions(title);

                        setModalState(() {
                          if (result['status'] == 'success') {
                            _suggestedTags = List<String>.from(result['suggestions']);
                            _suggestError = null;
                          } else {
                            _suggestedTags = [];
                            _suggestError = result['message'];
                          }
                        });
                      },
                      child: Text(AppLocalizations.of(context)!.createThread_suggestTags),
                    ),
                    if (_suggestError != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          _suggestError!,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ),
                    if (_suggestedTags.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        children: _suggestedTags
                            .where((tag) => !tempSelectedTags.contains(tag))
                            .map((tag) => InputChip(
                          label: Text(tag),
                          backgroundColor: Colors.blue.withOpacity(0.15), // Blue to match design language
                          avatar: const Icon(Icons.lightbulb_outline, size: 18, color: Colors.blue),
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            setModalState(() {
                              if (!_availableTags.contains(tag)) {
                                _availableTags.insert(0, tag);
                              }
                              if (!tempSelectedTags.contains(tag)) {
                                tempSelectedTags.add(tag);
                              }
                            });
                          },
                        ))
                            .toList(),
                      ),
                    ],
                    const Divider(),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _modalTagController,
                            decoration: InputDecoration(
                              labelText: AppLocalizations.of(context)!.createThread_addNewTag,
                            ),
                            onChanged: (value) {
                              setModalState(() {
                                _searchQuery = value.toUpperCase();
                              });
                            },
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.add),
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            final newTag = _modalTagController.text.trim();
                            if (newTag.isEmpty) {
                              setModalState(() {
                                _tagError = AppLocalizations.of(context)!.createThread_tagEmpty;
                              });
                              return;
                            }
                            if (newTag.length > 255) {
                              setModalState(() {
                                _tagError = AppLocalizations.of(context)!.createThread_tagMaxLength;
                              });
                              return;
                            }
                            if (!_availableTags.map((e) => e.toUpperCase()).contains(newTag.toUpperCase())) {
                              setModalState(() {
                                _availableTags.insert(0, newTag);
                                tempSelectedTags.add(newTag);
                                _tagError = null;
                              });
                              _modalTagController.clear();
                            }
                          },
                        ),
                      ],
                    ),
                    if (_tagError != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          _tagError!,
                          style: const TextStyle(color: Colors.red, fontSize: 12),
                        ),
                      ),
                    const SizedBox(height: 12),
                    Flexible(
                      child: Scrollbar(
                        thumbVisibility: true,
                        child: ListView(
                          shrinkWrap: true,
                          children: (() {
                            final filteredTags = _availableTags
                                .where((tag) => tag.toUpperCase().contains(_searchQuery))
                                .toList();

                            return filteredTags.map((tag) {
                              final selected = tempSelectedTags.contains(tag);
                              return CheckboxListTile(
                                title: Text(tag),
                                value: selected,
                                onChanged: (checked) {
                                  HapticFeedback.lightImpact();
                                  setModalState(() {
                                    if (checked!) {
                                      tempSelectedTags.add(tag);
                                    } else {
                                      tempSelectedTags.remove(tag);
                                    }
                                  });
                                },
                              );
                            }).toList();
                          })(),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        HapticFeedback.mediumImpact();
                        setState(() {
                          _selectedTags = List.from(tempSelectedTags);
                        });
                        Navigator.pop(context);
                      },
                      child: Text(AppLocalizations.of(context)!.createThread_done),
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }
  @override
  Widget build(BuildContext context) {
    final isEditing = widget.thread != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? AppLocalizations.of(context)!.createThread_editTitle : AppLocalizations.of(context)!.createThread_newTitle),
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
                    decoration: InputDecoration(
                      labelText: AppLocalizations.of(context)!.createThread_titleLabel,
                      border: const OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return AppLocalizations.of(context)!.createThread_titleRequired;
                      }
                      if (value.trim().length > 100) {
                        return AppLocalizations.of(context)!.createThread_titleMaxLength;
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
                      decoration: InputDecoration(
                        labelText: AppLocalizations.of(context)!.createThread_bodyLabel,
                        border: const OutlineInputBorder(),
                      ),
                      maxLines: null,
                      expands: true,
                      validator: (value) =>
                      (value == null || value.trim().isEmpty)
                          ? AppLocalizations.of(context)!.createThread_bodyRequired
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
                      Text(AppLocalizations.of(context)!.createThread_tags, style: Theme.of(context).textTheme.bodyLarge),
                      const SizedBox(height: 8),

                      /// New tag input
                      ElevatedButton(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          _showTagSelectionSheet();
                        },
                        child: Text(AppLocalizations.of(context)!.createThread_selectTags),
                      ),
                      const SizedBox(height: 8),

                      /// Selected tags shown as chips
                      Wrap(
                        spacing: 8,
                        children: _selectedTags.map((tag) => Chip(label: Text(tag))).toList(),
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
                    HapticFeedback.mediumImpact();
                    final navigator = Navigator.of(context);
                    final valid = _formKey.currentState!.validate();
                    if (!valid) return;

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
                      HapticFeedback.heavyImpact();
                      navigator.pop(saved);
                    } on SocketException {
                      HapticFeedback.vibrate();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(AppLocalizations.of(context)!.createThread_createError, style: const TextStyle(color: Colors.red))),
                      );
                    } catch (e) {
                      HapticFeedback.vibrate();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(AppLocalizations.of(context)!.createThread_generalError, style: const TextStyle(color: Colors.red))),
                      );
                    }
                  },
                  child: Text(isEditing ? AppLocalizations.of(context)!.createThread_save : AppLocalizations.of(context)!.createThread_post),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}