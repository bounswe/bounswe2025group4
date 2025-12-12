import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/forum_post.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../widgets/thread_tile.dart';
import 'create_thread_screen.dart';
import 'thread_detail_screen.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/widgets/a11y.dart';

class ForumPage extends StatefulWidget {
  const ForumPage({super.key});

  @override
  State<ForumPage> createState() => _ForumPageState();
}

class _ForumPageState extends State<ForumPage> {
  List<ForumPost> _posts = [];
  bool _isLoading = true;
  String? _errorMessage;
  List<String> _selectedTags = [];
  List<String> _allTags = [];
  late final ApiService _api;

  @override
  void initState() {
    super.initState();
    _api = ApiService(authProvider: context.read<AuthProvider>());
    _loadPosts();
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
        _allTags = tagsSet.toList()..sort();
      });
    } catch (e) {
      debugPrint('Failed to load tags: $e');
    }
  }

  void _showFilterModal() {
    _loadTags();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        List<String> tempSelected = List.from(_selectedTags);
        String searchQuery = '';

        return StatefulBuilder(
          builder: (context, setModalState) {
            final filteredTags =
                _allTags
                    .where(
                      (tag) =>
                          tag.toLowerCase().contains(searchQuery.toLowerCase()),
                    )
                    .toList();

            return SizedBox(
              height: MediaQuery.of(context).size.height * 0.7,
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: TextField(
                      decoration: InputDecoration(
                        labelText:
                            AppLocalizations.of(context)!.forumPage_searchTags,
                        prefixIcon: A11y(
                          label:
                              AppLocalizations.of(
                                context,
                              )!.forumPage_searchTags,
                          child: const Icon(Icons.search),
                        ),
                      ),
                      onChanged: (value) {
                        setModalState(() => searchQuery = value);
                      },
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: Scrollbar(
                      thumbVisibility: true,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children:
                              filteredTags.map((tag) {
                                final isSelected = tempSelected.contains(tag);
                                final isDark =
                                    Theme.of(context).brightness ==
                                    Brightness.dark;
                                return FilterChip(
                                  label: Text(
                                    tag,
                                    style: TextStyle(
                                      color:
                                          isSelected
                                              ? (isDark
                                                  ? Colors.blue.shade200
                                                  : Colors.blue.shade900)
                                              : null,
                                    ),
                                  ),
                                  selected: isSelected,
                                  onSelected: (selected) {
                                    setModalState(() {
                                      selected
                                          ? tempSelected.add(tag)
                                          : tempSelected.remove(tag);
                                    });
                                  },
                                  selectedColor:
                                      isDark
                                          ? Colors.blue.shade900.withOpacity(
                                            0.3,
                                          )
                                          : Colors.blue.withOpacity(0.2),
                                  checkmarkColor:
                                      isDark
                                          ? Colors.blue.shade300
                                          : Colors.blue,
                                  backgroundColor:
                                      isDark ? Colors.grey.shade800 : null,
                                );
                              }).toList(),
                        ),
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        ElevatedButton(
                          onPressed: () {
                            setState(() => _selectedTags = tempSelected);
                            Navigator.pop(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                          ),
                          child: Text(
                            AppLocalizations.of(context)!.forumPage_filter,
                          ),
                        ),
                        OutlinedButton(
                          onPressed: () {
                            setState(() => _selectedTags.clear());
                            Navigator.pop(context);
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.blue,
                            side: const BorderSide(color: Colors.blue),
                          ),
                          child: Text(
                            AppLocalizations.of(context)!.forumPage_reset,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  List<ForumPost> get _filteredPosts {
    if (_selectedTags.isEmpty) return _posts;
    return _posts
        .where(
          (post) => post.tags.any((tag) => _selectedTags.contains(tag)),
        )
        .toList();
  }

  Future<void> _loadPosts() async {
    setState(() => _isLoading = true);
    try {
      final posts = await _api.fetchForumPosts();
      setState(() {
        _posts = posts;
        _errorMessage = null;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext ctx) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(AppLocalizations.of(context)!.forumPage_title),
      ),
      body: Stack(
        children: [
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_errorMessage != null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    AppLocalizations.of(context)!.forumPage_loadError,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadPosts,
                    child: Text(AppLocalizations.of(context)!.common_retry),
                  ),
                ],
              ),
            )
          else if (_posts.isEmpty)
            Center(
              child: Text(
                AppLocalizations.of(context)!.forumPage_noDiscussions,
              ),
            )
          else ...[
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: ElevatedButton.icon(
                      onPressed: _showFilterModal,
                      icon: A11y(
                        label: AppLocalizations.of(context)!.forumPage_filter,
                        child: const Icon(Icons.filter_list),
                      ),
                      label: Text(
                        AppLocalizations.of(context)!.forumPage_filter,
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _loadPosts,
                    child: Scrollbar(
                      thumbVisibility: true,
                      child: ListView.builder(
                        padding: const EdgeInsets.only(bottom: 100),
                        itemCount: _filteredPosts.length,
                        itemBuilder: (_, i) {
                          final post = _filteredPosts[i];
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            child: ThreadTile(
                              post: post,
                              onTap: () async {
                                final result = await Navigator.push(
                                  ctx,
                                  MaterialPageRoute(
                                    builder:
                                        (_) => ThreadDetailScreen(post: post),
                                  ),
                                );
                                if (result is ForumPost) {
                                  setState(() {
                                    final index = _posts.indexWhere(
                                      (p) => p.id == result.id,
                                    );
                                    if (index != -1) {
                                      _posts[index] = result;
                                    }
                                  });
                                } else if (result == 'deleted') {
                                  setState(() {
                                    _posts.removeWhere(
                                      (p) => p.id == post.id,
                                    );
                                  });
                                } else if (result == 'refresh') {
                                  _loadPosts();
                                }
                              },
                              onDelete: () {
                                setState(() {
                                  _posts.removeWhere((p) => p.id == post.id);
                                });
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
          // Always show FAB
          Positioned(
            bottom: 16,
            right: 16,
            child: FloatingActionButton(
              child: A11y(
                label: AppLocalizations.of(context)!.createThread_newTitle,
                child: const Icon(Icons.add),
              ),
              onPressed: () async {
                final created = await Navigator.push<ForumPost>(
                  ctx,
                  MaterialPageRoute(builder: (_) => const CreateThreadScreen()),
                );
                if (created != null) {
                  setState(() {
                    _posts.insert(0, created);
                  });
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}
