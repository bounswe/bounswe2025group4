class NeedsEmailVerificationException implements Exception {
  final String message;
  const NeedsEmailVerificationException([
    this.message = 'Please verify your email to complete registration.',
  ]);

  @override
  String toString() => message;
}