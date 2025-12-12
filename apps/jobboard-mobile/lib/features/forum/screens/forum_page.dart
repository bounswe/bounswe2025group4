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
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  late final ApiService _api;

  @override
  void initState() {
    super.initState();
    _api = ApiService(authProvider: context.read<AuthProvider>());
    _loadPosts();
    _loadTags();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
    var filtered = _posts;
    
    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((post) {
        return post.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
               post.content.toLowerCase().contains(_searchQuery.toLowerCase()) ||
               post.authorUsername.toLowerCase().contains(_searchQuery.toLowerCase());
      }).toList();
    }
    
    // Filter by tags
    if (_selectedTags.isNotEmpty) {
      filtered = filtered.where((post) => 
        post.tags.any((tag) => _selectedTags.contains(tag))
      ).toList();
    }
    
    return filtered;
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
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.grey[50],
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: isDark ? Colors.grey[900] : Colors.white,
        title: Text(
          AppLocalizations.of(context)!.forumPage_title,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 28,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        actions: [
          // Filter button
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton(
              onPressed: _showFilterModal,
              icon: A11y(
                label: AppLocalizations.of(context)!.forumPage_filter,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _selectedTags.isNotEmpty
                        ? Colors.blue.withOpacity(0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Badge(
                    isLabelVisible: _selectedTags.isNotEmpty,
                    label: Text('${_selectedTags.length}'),
                    child: Icon(
                      Icons.filter_list_rounded,
                      color: _selectedTags.isNotEmpty
                          ? Colors.blue
                          : (isDark ? Colors.grey[400] : Colors.grey[700]),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline_rounded,
                        size: 64,
                        color: Colors.red[300],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        AppLocalizations.of(context)!.forumPage_loadError,
                        style: TextStyle(
                          fontSize: 16,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _loadPosts,
                        icon: const Icon(Icons.refresh_rounded),
                        label: Text(AppLocalizations.of(context)!.common_retry),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              : _posts.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.forum_outlined,
                            size: 64,
                            color: isDark ? Colors.grey[700] : Colors.grey[300],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            AppLocalizations.of(context)!.forumPage_noDiscussions,
                            style: TextStyle(
                              fontSize: 16,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    )
                  : Column(
                      children: [
                        // Search bar
                        Container(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                          color: isDark ? Colors.grey[900] : Colors.white,
                          child: TextField(
                            controller: _searchController,
                            onChanged: (value) {
                              setState(() {
                                _searchQuery = value;
                              });
                            },
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                            decoration: InputDecoration(
                              hintText: 'Search posts...',
                              hintStyle: TextStyle(
                                color: isDark ? Colors.grey[600] : Colors.grey[400],
                              ),
                              prefixIcon: Icon(
                                Icons.search_rounded,
                                color: isDark ? Colors.grey[500] : Colors.grey[600],
                              ),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: Icon(
                                        Icons.clear_rounded,
                                        color: isDark ? Colors.grey[500] : Colors.grey[600],
                                      ),
                                      onPressed: () {
                                        _searchController.clear();
                                        setState(() {
                                          _searchQuery = '';
                                        });
                                      },
                                    )
                                  : null,
                              filled: true,
                              fillColor: isDark ? Colors.grey[850] : Colors.grey[100],
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                          ),
                        ),
                        
                        // Posts list
                        Expanded(
                          child: Stack(
                            children: [
                              RefreshIndicator(
                                onRefresh: _loadPosts,
                                child: _filteredPosts.isEmpty
                                    ? Center(
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              Icons.search_off_rounded,
                                              size: 64,
                                              color: isDark ? Colors.grey[700] : Colors.grey[300],
                                            ),
                                            const SizedBox(height: 16),
                                            Text(
                                              _searchQuery.isNotEmpty
                                                  ? 'No posts found matching "$_searchQuery"'
                                                  : 'No posts match your filters',
                                              style: TextStyle(
                                                fontSize: 16,
                                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          ],
                                        ),
                                      )
                                    : ListView.builder(
                                        padding: const EdgeInsets.only(top: 8, bottom: 100),
                                        itemCount: _filteredPosts.length,
                                        itemBuilder: (_, i) {
                                          final post = _filteredPosts[i];
                                          return ThreadTile(
                                post: post,
                                onTap: () async {
                                  final result = await Navigator.push(
                                    ctx,
                                    MaterialPageRoute(
                                      builder: (_) => ThreadDetailScreen(post: post),
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
                                      _posts.removeWhere((p) => p.id == post.id);
                                    });
                                  } else if (result == 'refresh') {
                                    _loadPosts();
                                  }
                                },
                                onPostUpdated: (updatedPost) {
                                  setState(() {
                                    final index = _posts.indexWhere(
                                      (p) => p.id == updatedPost.id,
                                    );
                                    if (index != -1) {
                                      _posts[index] = updatedPost;
                                    }
                                  });
                                },
                                onDelete: () {
                                  setState(() {
                                    _posts.removeWhere((p) => p.id == post.id);
                                  });
                                },
                              );
                                        },
                                      ),
                              ),
                              Positioned(
                                        bottom: 20,
                                        right: 20,
                                        child: FloatingActionButton.extended(
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
                                          backgroundColor: Colors.blue,
                                          elevation: 4,
                                          icon: const Icon(Icons.edit_rounded, color: Colors.white),
                                          label: const Text(
                                            'New Post',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ),
                            ],
                          ),
                        ),
                      ],
                    ),
    );
  }
}
