import 'package:flutter/material.dart';

/// A11y helper to combine Tooltip and Semantics for non-text content.
/// - Provides a long-press tooltip on mobile and hover tooltip on desktop/web.
/// - Provides screen reader label via Semantics.
/// - Set [decorative] true for purely decorative elements to exclude from semantics.
class A11y extends StatelessWidget {
  final Widget child;
  final String? label;
  final bool decorative;

  const A11y({
    super.key,
    required this.child,
    this.label,
    this.decorative = false,
  });

  @override
  Widget build(BuildContext context) {
    if (decorative) {
      return ExcludeSemantics(child: child);
    }

    final String tooltipMessage = (label ?? '').trim();

    // Tooltip requires a non-empty message to render text. Always pass message when label provided.
    // Force long-press trigger on mobile to make behavior explicit.
    return Tooltip(
      message: tooltipMessage,
      triggerMode: TooltipTriggerMode.longPress,
      // Ensure semantics are present for screen readers even if tooltip is not triggered
      child: Semantics(
        label: label,
        child: child,
      ),
    );
  }
}


