import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/discussion_thread.dart';
import '../widgets/thread_tile.dart';
import 'create_thread_screen.dart';
import 'thread_detail_screen.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';

class ForumPage extends StatefulWidget {
  const ForumPage({super.key});

  @override
  State<ForumPage> createState() => _ForumPageState();
}

class _ForumPageState extends State<ForumPage> {
  List<DiscussionThread> _threads = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadThreads();
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
      appBar: AppBar(automaticallyImplyLeading: false, title: const Text('Forum')),
      body: Stack(
        children: [
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_errorMessage != null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Failed to load Forum: Please check your connection and try again.', style: TextStyle(color: Colors.red)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _loadThreads,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          else if (_threads.isEmpty)
              const Center(child: Text('No discussions yet'))
            else
              RefreshIndicator(
                onRefresh: _loadThreads,
                  child: Scrollbar(
                    thumbVisibility: true,
                    child: ListView.builder(
                      padding: const EdgeInsets.only(bottom: 100),
                      itemCount: _threads.length,
                      itemBuilder: (_, i) {
                        final t = _threads[i];
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
          // Always show FAB
          Positioned(
            bottom: 16,
            right: 16,
            child: FloatingActionButton(
              child: const Icon(Icons.add),
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