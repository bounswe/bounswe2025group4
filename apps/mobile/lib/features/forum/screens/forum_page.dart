import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/discussion_thread.dart';
import '../widgets/thread_tile.dart';
import 'create_thread_screen.dart';
import 'thread_detail_screen.dart';

class ForumPage extends StatefulWidget {
  const ForumPage({super.key});

  @override
  State<ForumPage> createState() => _ForumPageState();
}

class _ForumPageState extends State<ForumPage> {
  // Local state instead of provider
  List<DiscussionThread> _threads = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadThreads();
  }

  Future<void> _loadThreads() async {
    setState(() => _isLoading = true);
    _threads = await ApiService().fetchDiscussionThreads();
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext ctx) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forum')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _threads.length,
              itemBuilder: (_, i) {
                final t = _threads[i];
                return ThreadTile(
                  thread: t,
                  onTap: () => Navigator.push(
                      ctx, MaterialPageRoute(
                    builder: (_) => ThreadDetailScreen(thread: t),
                  )),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () => Navigator.push(
          ctx, MaterialPageRoute(builder: (_) => const CreateThreadScreen()),
        ),
      ),
    );
  }
}