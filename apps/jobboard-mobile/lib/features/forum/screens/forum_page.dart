import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/discussion_thread.dart';
import '../widgets/thread_tile.dart';
import 'create_thread_screen.dart';
import 'thread_detail_screen.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/widgets/a11y.dart';

class ForumPage extends StatefulWidget {
  const ForumPage({super.key});

  @override
  State<ForumPage> createState() => _ForumPageState();
}

class _ForumPageState extends State<ForumPage> {
  List<DiscussionThread> _threads = [];
  bool _isLoading = true;
  String? _errorMessage;
  List<String> _selectedTags = [];
  List<String> _allTags = [];

  @override
  void initState() {
    super.initState();
    _loadThreads();
    _loadTags();
  }

  Future<void> _loadTags() async {
    try {
      final tags = await ApiService(authProvider: context.read<AuthProvider>()).fetchDiscussionTags();
      setState(() {
        _allTags = tags;
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
            final filteredTags = _allTags
                .where((tag) => tag.toLowerCase().contains(searchQuery.toLowerCase()))
                .toList();

            return SizedBox(
              height: MediaQuery.of(context).size.height * 0.7,
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: TextField(
                      decoration: InputDecoration(
                        labelText: AppLocalizations.of(context)!.forumPage_searchTags,
                        prefixIcon: A11y(label: 'Search tags', child: const Icon(Icons.search)),
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
                          children: filteredTags.map((tag) {
                            final isSelected = tempSelected.contains(tag);
                            return FilterChip(
                              label: Text(tag),
                              selected: isSelected,
                              onSelected: (selected) {
                                setModalState(() {
                                  selected
                                      ? tempSelected.add(tag)
                                      : tempSelected.remove(tag);
                                });
                              },
                              selectedColor: Colors.blue.withOpacity(0.2),
                              checkmarkColor: Colors.blue,
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
                          child: Text(AppLocalizations.of(context)!.forumPage_filter),
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
                          child: Text(AppLocalizations.of(context)!.forumPage_reset),
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

  List<DiscussionThread> get _filteredThreads {
    if (_selectedTags.isEmpty) return _threads;
    return _threads.where((thread) =>
        thread.tags.any((tag) => _selectedTags.contains(tag))).toList();
  }

  Future<void> _loadThreads() async {
    setState(() => _isLoading = true);
    try {
      final threads = await ApiService(authProvider: context.read<AuthProvider>())
          .fetchDiscussionThreads();
      setState(() {
        _threads = threads;
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
      appBar: AppBar(automaticallyImplyLeading: false, title: Text(AppLocalizations.of(context)!.forumPage_title)),
      body: Stack(
        children: [
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_errorMessage != null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(AppLocalizations.of(context)!.forumPage_loadError, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadThreads,
                    child: Text(AppLocalizations.of(context)!.common_retry),
                  ),
                ],
              ),
            )
          else if (_threads.isEmpty)
              Center(child: Text(AppLocalizations.of(context)!.forumPage_noDiscussions))
            else ...[
                Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: ElevatedButton.icon(
                          onPressed: _showFilterModal,
                          icon: const A11y(label: 'Open filters', child: Icon(Icons.filter_list)),
                          label: Text(AppLocalizations.of(context)!.forumPage_filter),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: _loadThreads,
                        child: Scrollbar(
                          thumbVisibility: true,
                          child: ListView.builder(
                            padding: const EdgeInsets.only(bottom: 100),
                            itemCount: _filteredThreads.length,
                            itemBuilder: (_, i) {
                              final t = _filteredThreads[i];
                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                child: ThreadTile(
                                  thread: t,
                                  onTap: () async {
                                    final result = await Navigator.push(
                                      ctx,
                                      MaterialPageRoute(
                                        builder: (_) => ThreadDetailScreen(thread: t),
                                      ),
                                    );
                                    if (result is DiscussionThread) {
                                      setState(() {
                                        final index = _threads.indexWhere((thread) => thread.id == result.id);
                                        if (index != -1) {
                                          _threads[index] = result;
                                        }
                                      });
                                    } else if (result == 'deleted') {
                                      setState(() {
                                        _threads.removeWhere((thread) => thread.id == t.id);
                                      });
                                    }
                                  },
                                  onEdit: (updatedThread) {
                                    setState(() {
                                      final index = _threads.indexWhere((th) => th.id == updatedThread.id);
                                      if (index != -1) {
                                        _threads[index] = updatedThread;
                                      }
                                    });
                                  },
                                  onDelete: () {
                                    setState(() {
                                      _threads.removeWhere((th) => th.id == t.id);
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
            child: const A11y(label: 'Create new discussion', child: Icon(Icons.add)),
              onPressed: () async {
                final created = await Navigator.push<DiscussionThread>(
                  ctx,
                  MaterialPageRoute(builder: (_) => const CreateThreadScreen()),
                );
                if (created != null) {
                  setState(() {
                    _threads.insert(0, created);
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