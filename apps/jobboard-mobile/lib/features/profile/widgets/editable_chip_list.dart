import 'package:flutter/material.dart';
import '../../../generated/l10n/app_localizations.dart';

class EditableChipList extends StatefulWidget {
  final List<String> items;
  final String title;
  final String emptyMessage;
  final String addDialogTitle;
  final String addDialogHint;
  final Function(List<String>) onSave;
  final bool isEditable;

  const EditableChipList({
    Key? key,
    required this.items,
    required this.title,
    required this.emptyMessage,
    required this.addDialogTitle,
    required this.addDialogHint,
    required this.onSave,
    this.isEditable = false,
  }) : super(key: key);

  @override
  State<EditableChipList> createState() => _EditableChipListState();
}

class _EditableChipListState extends State<EditableChipList> {
  late List<String> _items;

  @override
  void initState() {
    super.initState();
    _items = List.from(widget.items);
  }

  @override
  void didUpdateWidget(EditableChipList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.items != widget.items) {
      _items = List.from(widget.items);
    }
  }

  void _showAddDialog() {
    final textController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(widget.addDialogTitle),
        content: TextField(
          controller: textController,
          decoration: InputDecoration(
            hintText: widget.addDialogHint,
          ),
          autofocus: true,
          onSubmitted: (_) => _addItem(textController.text),
        ),
        actions: [
          TextButton(
            child: Text(AppLocalizations.of(context)!.profileWidgets_cancel),
            onPressed: () => Navigator.of(context).pop(),
          ),
          ElevatedButton(
            child: Text(AppLocalizations.of(context)!.profileWidgets_add),
            onPressed: () {
              _addItem(textController.text);
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  void _addItem(String item) {
    if (item.isEmpty) return;

    setState(() {
      if (!_items.contains(item)) {
        _items.add(item);
        widget.onSave(_items);
      }
    });
  }

  void _removeItem(String item) {
    setState(() {
      _items.remove(item);
      widget.onSave(_items);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              widget.title,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (widget.isEditable)
              TextButton.icon(
                icon: const Icon(Icons.add),
                label: Text(AppLocalizations.of(context)!.profileWidgets_add),
                onPressed: _showAddDialog,
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (_items.isEmpty)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(widget.emptyMessage),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _items.map((item) {
              return Chip(
                label: Text(item),
                deleteIcon: widget.isEditable ? const Icon(Icons.close, size: 18) : null,
                onDeleted: widget.isEditable ? () => _removeItem(item) : null,
              );
            }).toList(),
          ),
      ],
    );
  }
}