import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/forum_post.dart';
import '../../../core/services/tag_recommendation_service.dart';
import '../../../generated/l10n/app_localizations.dart';

class CreateThreadScreen extends StatefulWidget {
  final ForumPost? post;
  const CreateThreadScreen({super.key, this.post});

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
  late final ApiService _api;

  @override
  void initState() {
    super.initState();
    _api = ApiService(authProvider: context.read<AuthProvider>());
    _titleCtrl = TextEditingController(text: widget.post?.title ?? '');
    _bodyCtrl = TextEditingController(text: widget.post?.content ?? '');
    if (widget.post != null) {
      _selectedTags = List<String>.from(widget.post!.tags);
    }
    _loadTags();
  }

  Future<void> _loadTags() async {
    try {
      // Extract unique tags from all posts
      final posts = await _api.fetchForumPosts();
      final tagsSet = <String>{};
      for (var post in posts) {
        tagsSet.addAll(post.tags);
      }
      setState(() {
        _availableTags = tagsSet.toList()..sort();
      });
    } catch (e) {
      debugPrint('Failed to load tags: $e');
    }
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
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      builder: (_) {
        final TextEditingController _modalTagController =
            TextEditingController();

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
                            _suggestError =
                                AppLocalizations.of(
                                  context,
                                )!.createThread_enterTitleForSuggestions;
                          });
                          return;
                        }
                        final result =
                            await TagRecommendationService.fetchSuggestions(
                              title,
                            );

                        setModalState(() {
                          if (result['status'] == 'success') {
                            _suggestedTags = List<String>.from(
                              result['suggestions'],
                            );
                            _suggestError = null;
                          } else {
                            _suggestedTags = [];
                            _suggestError = result['message'];
                          }
                        });
                      },
                      child: Text(
                        AppLocalizations.of(context)!.createThread_suggestTags,
                      ),
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
                        children:
                            _suggestedTags
                                .where((tag) => !tempSelectedTags.contains(tag))
                                .map(
                                  (tag) => InputChip(
                                    label: Text(
                                      tag,
                                      style: TextStyle(
                                        color:
                                            Theme.of(context).brightness ==
                                                    Brightness.dark
                                                ? Colors.blue.shade200
                                                : Colors.blue.shade900,
                                      ),
                                    ),
                                    backgroundColor:
                                        Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Colors.blue.shade900.withOpacity(
                                              0.3,
                                            )
                                            : Colors.blue.withOpacity(
                                              0.15,
                                            ), // Blue to match design language
                                    avatar: Icon(
                                      Icons.lightbulb_outline,
                                      size: 18,
                                      color:
                                          Theme.of(context).brightness ==
                                                  Brightness.dark
                                              ? Colors.blue.shade300
                                              : Colors.blue,
                                    ),
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
                                  ),
                                )
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
                              labelText:
                                  AppLocalizations.of(
                                    context,
                                  )!.createThread_addNewTag,
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
                                _tagError =
                                    AppLocalizations.of(
                                      context,
                                    )!.createThread_tagEmpty;
                              });
                              return;
                            }
                            if (newTag.length > 255) {
                              setModalState(() {
                                _tagError =
                                    AppLocalizations.of(
                                      context,
                                    )!.createThread_tagMaxLength;
                              });
                              return;
                            }
                            if (!_availableTags
                                .map((e) => e.toUpperCase())
                                .contains(newTag.toUpperCase())) {
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
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    const SizedBox(height: 12),
                    Flexible(
                      child: Scrollbar(
                        thumbVisibility: true,
                        child: ListView(
                          shrinkWrap: true,
                          children:
                              (() {
                                final filteredTags =
                                    _availableTags
                                        .where(
                                          (tag) => tag.toUpperCase().contains(
                                            _searchQuery,
                                          ),
                                        )
                                        .toList();

                                return filteredTags.map((tag) {
                                  final selected = tempSelectedTags.contains(
                                    tag,
                                  );
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
                      child: Text(
                        AppLocalizations.of(context)!.createThread_done,
                      ),
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
    final isEditing = widget.post != null;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.grey[50],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: isDark ? Colors.grey[900] : Colors.white,
        title: Text(
          isEditing
              ? AppLocalizations.of(context)!.createThread_editTitle
              : AppLocalizations.of(context)!.createThread_newTitle,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        iconTheme: IconThemeData(
          color: isDark ? Colors.white : Colors.black,
        ),
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    /// Title
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? Colors.grey[850] : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppLocalizations.of(context)!.createThread_titleLabel,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.grey[400] : Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _titleCtrl,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                            decoration: InputDecoration(
                              hintText: 'Enter a descriptive title...',
                              hintStyle: TextStyle(
                                color: isDark ? Colors.grey[600] : Colors.grey[400],
                                fontWeight: FontWeight.normal,
                              ),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                            ),
                            textCapitalization: TextCapitalization.sentences,
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return AppLocalizations.of(
                                  context,
                                )!.createThread_titleRequired;
                              }
                              if (value.trim().length > 100) {
                                return AppLocalizations.of(
                                  context,
                                )!.createThread_titleMaxLength;
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    /// Body
                    Container(
                      height: 300,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.grey[850] : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppLocalizations.of(context)!.createThread_bodyLabel,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.grey[400] : Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Expanded(
                            child: TextFormField(
                              controller: _bodyCtrl,
                              style: TextStyle(
                                fontSize: 16,
                                color: isDark ? Colors.grey[200] : Colors.black87,
                                height: 1.5,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Share your thoughts...',
                                hintStyle: TextStyle(
                                  color: isDark ? Colors.grey[600] : Colors.grey[400],
                                ),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.zero,
                              ),
                              maxLines: null,
                              expands: true,
                              textCapitalization: TextCapitalization.sentences,
                              validator: (value) =>
                                  (value == null || value.trim().isEmpty)
                                      ? AppLocalizations.of(
                                        context,
                                      )!.createThread_bodyRequired
                                      : null,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    /// Tags
                    Container(
                      decoration: BoxDecoration(
                        color: isDark ? Colors.grey[850] : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                AppLocalizations.of(context)!.createThread_tags,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.grey[400] : Colors.grey[700],
                                ),
                              ),
                              const Spacer(),
                              TextButton.icon(
                                onPressed: () {
                                  HapticFeedback.lightImpact();
                                  _showTagSelectionSheet();
                                },
                                icon: Icon(
                                  Icons.add_circle_outline_rounded,
                                  size: 18,
                                  color: Colors.blue,
                                ),
                                label: Text(
                                  AppLocalizations.of(context)!.createThread_selectTags,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (_selectedTags.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: _selectedTags.map((tag) => Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? Colors.blue[900]!.withOpacity(0.3)
                                      : Colors.blue[50],
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      tag,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: isDark ? Colors.blue[200] : Colors.blue[700],
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          _selectedTags.remove(tag);
                                        });
                                      },
                                      child: Icon(
                                        Icons.close_rounded,
                                        size: 16,
                                        color: isDark ? Colors.blue[200] : Colors.blue[700],
                                      ),
                                    ),
                                  ],
                                ),
                              )).toList(),
                            ),
                          ] else ...[
                            const SizedBox(height: 8),
                            Text(
                              'No tags selected',
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? Colors.grey[600] : Colors.grey[500],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            /// Submit Button
            Container(
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[900] : Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 12,
                bottom: MediaQuery.of(context).padding.bottom + 12,
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    HapticFeedback.mediumImpact();
                    final navigator = Navigator.of(context);
                    final valid = _formKey.currentState!.validate();
                    if (!valid) return;

                    try {
                      final ForumPost saved =
                          isEditing
                              ? await _api.updateForumPost(
                                postId: widget.post!.id,
                                title: _titleCtrl.text.trim(),
                                content: _bodyCtrl.text.trim(),
                                tags: _selectedTags,
                              )
                              : await _api.createForumPost(
                                title: _titleCtrl.text.trim(),
                                content: _bodyCtrl.text.trim(),
                                tags: _selectedTags,
                              );
                      if (!mounted) return;
                      HapticFeedback.heavyImpact();
                      navigator.pop(saved);
                    } on SocketException {
                      HapticFeedback.vibrate();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppLocalizations.of(
                              context,
                            )!.createThread_createError,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      );
                    } catch (e) {
                      HapticFeedback.vibrate();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppLocalizations.of(
                              context,
                            )!.createThread_generalError,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    isEditing
                        ? AppLocalizations.of(context)!.createThread_save
                        : AppLocalizations.of(context)!.createThread_post,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
