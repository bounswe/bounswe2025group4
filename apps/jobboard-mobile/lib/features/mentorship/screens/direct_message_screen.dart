import 'package:flutter/material.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/widgets/a11y.dart';
// import 'package:file_picker/file_picker.dart'; // Import if you use file_picker
// import 'package:image_picker/image_picker.dart'; // Import if you use image_picker

class DirectMessageScreen extends StatefulWidget {
  final String mentorId;
  final String mentorName;
  final int? resumeReviewId;

  const DirectMessageScreen({
    super.key,
    required this.mentorId,
    required this.mentorName,
    this.resumeReviewId,
  });

  @override
  State<DirectMessageScreen> createState() => _DirectMessageScreenState();
}

class _DirectMessageScreenState extends State<DirectMessageScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _messages = []; // TODO: Load real messages

  @override
  void initState() {
    super.initState();
    // TODO: Fetch initial messages for widget.mentorId
    // For now, add some dummy messages
    _messages.addAll([
      {'sender': 'mentor', 'text': 'Hi there! How can I help you today?'},
      {
        'sender': 'mentee',
        'text': 'Hi ${widget.mentorName}, I had a question about my resume.',
      },
      {
        'sender': 'mentor',
        'text': 'Sure, feel free to share it or ask your question.',
      },
    ]);
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _messages.add({'sender': 'mentee', 'text': text});
        // TODO: Send message to backend/service
        print('Sending message to ${widget.mentorId}: $text');
      });
      _messageController.clear();
      // TODO: Scroll to bottom
    }
  }

  void _attachFile() async {
    // TODO: Implement file attachment logic
    // Example using file_picker (ensure you add the dependency)
    /*
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (result != null) {
      PlatformFile file = result.files.first;
      print('Picked file: ${file.name}');
      // TODO: Upload file and potentially send a message indicating file attached
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Attached ${file.name}')),
      );
    } else {
      // User canceled the picker
    }
    */
    print('Attach file button pressed for mentor ${widget.mentorId}');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context)!.directMessage_fileNotImplemented)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context)!.directMessage_title(widget.mentorName))),
      body: Column(
        children: [
          // Message List Area
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8.0),
              reverse:
                  false, // Typically true for chats, but false for simple list demo
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isMe = message['sender'] == 'mentee';
                return _buildMessageBubble(message['text'], isMe);
              },
            ),
          ),
          // Input Area
          _buildMessageInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe) {
    final theme = Theme.of(context);
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
        padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 14.0),
        decoration: BoxDecoration(
          color:
              isMe
                  ? theme.colorScheme.primary
                  : theme.colorScheme.secondaryContainer,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16.0),
            topRight: const Radius.circular(16.0),
            bottomLeft: isMe ? const Radius.circular(16.0) : Radius.zero,
            bottomRight: isMe ? Radius.zero : const Radius.circular(16.0),
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            color:
                isMe
                    ? theme.colorScheme.onPrimary
                    : theme.colorScheme.onSecondaryContainer,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageInputArea() {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
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
          // Attach File Button
          IconButton(
            icon: A11y(label: 'Attach file', child: Icon(
              Icons.attach_file,
              color: theme.iconTheme.color?.withOpacity(0.7),
            )),
            onPressed: _attachFile,
            tooltip: AppLocalizations.of(context)!.directMessage_attachFile,
          ),
          // Message Text Field
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: AppLocalizations.of(context)!.directMessage_typeMessage,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20.0),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: theme.dividerColor.withOpacity(0.05),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 10.0,
                ),
              ),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
              minLines: 1,
              maxLines: 5,
            ),
          ),
          const SizedBox(width: 4),
          // Send Button
          IconButton(
            icon: A11y(label: 'Send message', child: Icon(Icons.send, color: theme.colorScheme.primary)),
            onPressed: _sendMessage,
            tooltip: AppLocalizations.of(context)!.directMessage_sendMessage,
          ),
        ],
      ),
    );
  }
}
