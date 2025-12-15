import 'package:flutter/material.dart';
import 'dart:io';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:provider/provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/widgets/a11y.dart';
import 'package:mobile/features/mentorship/providers/chat_provider.dart';
import '../../../core/models/chat_message.dart';
import '../../../core/providers/auth_provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';


class DirectMessageScreen extends StatefulWidget {
  final int conversationId;
  final String peerName;
  final int? resumeReviewId;
  final bool isMentor;

  const DirectMessageScreen({
    super.key,
    required this.conversationId,
    required this.peerName,
    this.resumeReviewId,
    required this.isMentor,


  });

  @override
  State<DirectMessageScreen> createState() => _DirectMessageScreenState();
}

class _DirectMessageScreenState extends State<DirectMessageScreen> with WidgetsBindingObserver {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  ChatProvider? _chatProvider;
  AuthProvider? _authProvider;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Save references to providers for safe use in dispose()
    _chatProvider ??= context.read<ChatProvider>();
    _authProvider ??= context.read<AuthProvider>();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatProvider == null || _authProvider == null) {
        _chatProvider = context.read<ChatProvider>();
        _authProvider = context.read<AuthProvider>();
      }

      _chatProvider!.connect(
        jwtToken: _authProvider!.token!,
        conversationId: widget.conversationId,
      );
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    // Disconnect from chat WebSocket when app goes to background
    // This ensures notifications are sent when user is not actively viewing the chat
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      print('[DirectMessageScreen] App paused/inactive, disconnecting chat WebSocket');
      if (mounted && _chatProvider != null) {
        _chatProvider!.disconnect();
      }
    } else if (state == AppLifecycleState.resumed) {
      // Reconnect when app comes back to foreground
      print('[DirectMessageScreen] App resumed, reconnecting chat WebSocket');
      if (mounted && _chatProvider != null && _authProvider != null) {
        if (_authProvider!.token != null) {
          _chatProvider!.connect(
            jwtToken: _authProvider!.token!,
            conversationId: widget.conversationId,
          );
        }
      }
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // Disconnect from chat WebSocket when leaving the screen
    // This ensures notifications are sent when user is not actively viewing the chat
    print('[DirectMessageScreen] Disposing, disconnecting chat WebSocket');
    if (_chatProvider != null) {
      _chatProvider!.disconnect();
    }
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    context.read<ChatProvider>().sendMessage(
      conversationId: widget.conversationId,
      content: text,
    );

    _messageController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 80,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _viewResume(BuildContext context) async {
    final api = context.read<ApiService>();

    try {
      final url = await api.getResumeFileUrl(widget.resumeReviewId!);

      // Download file
      final tempDir = await Directory.systemTemp.createTemp();
      final filePath = '${tempDir.path}/resume.pdf';

      final request = await HttpClient().getUrl(Uri.parse(url));
      final response = await request.close();

      final file = File(filePath);
      await response.pipe(file.openWrite());

      if (!mounted) return;

      // Open PDF inside app
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => PdfViewerScreen(filePath: filePath),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to open resume')),
      );
    }
  }


  Future<File?> _pickPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result == null) return null;
    return File(result.files.single.path!);
  }

  Future<void> _uploadResume(BuildContext context) async {
    final api = context.read<ApiService>();

    final file = await _pickPdf();
    if (file == null) return;

    try {
      await api.uploadResumeFile(widget.resumeReviewId!, file);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Resume uploaded successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to upload resume')),
      );
    }
  }



  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chatProvider = context.watch<ChatProvider>();
    final messages = chatProvider.messages;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!
              .directMessage_title(widget.peerName),
        ),
        actions: [
          if (widget.resumeReviewId != null)
            IconButton(
              icon: Icon(widget.isMentor ? Icons.picture_as_pdf : Icons.upload_file),
              tooltip: widget.isMentor ? 'View Resume' : 'Send Resume',
              onPressed: () {
                if (widget.isMentor) {
                  _viewResume(context);
                } else {
                  _uploadResume(context);
                }
              },
            ),
        ]

      ),
      body: Column(
        children: [
          // MESSAGE LIST
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(8.0),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final ChatMessage message = messages[index];
                final myUsername =
                    context.read<AuthProvider>().currentUser!.username;
                final isMe = message.senderUsername == myUsername;

                return _buildMessageBubble(message.content, isMe);
              },
            ),
          ),

          // INPUT
          _buildMessageInputArea(theme),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe) {
    final theme = Theme.of(context);
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
        decoration: BoxDecoration(
          color: isMe
              ? theme.colorScheme.primary
              : theme.colorScheme.secondaryContainer,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
            bottomRight: isMe ? Radius.zero : const Radius.circular(16),
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isMe
                ? theme.colorScheme.onPrimary
                : theme.colorScheme.onSecondaryContainer,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageInputArea(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: theme.canvasColor,
        boxShadow: const [
          BoxShadow(
            offset: Offset(0, -1),
            blurRadius: 1,
            color: Colors.black12,
          ),
        ],
      ),
      child: Row(
        children: [

          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: AppLocalizations.of(context)!
                    .directMessage_typeMessage,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: theme.dividerColor.withOpacity(0.05),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
              ),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
              minLines: 1,
              maxLines: 5,
            ),
          ),
          IconButton(
            icon: A11y(
              label: 'Send message',
              child: Icon(
                Icons.send,
                color: theme.colorScheme.primary,
              ),
            ),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }
}


class PdfViewerScreen extends StatelessWidget {
  final String filePath;

  const PdfViewerScreen({
    super.key,
    required this.filePath,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Resume'),
      ),
      body: PDFView(
        filePath: filePath,
        enableSwipe: true,
        swipeHorizontal: false,
        autoSpacing: true,
        pageFling: true,
        onError: (error) {
          debugPrint('PDF error: $error');
        },
        onPageError: (page, error) {
          debugPrint('PDF page error: $page → $error');
        },
      ),
    );
  }
}