enum PasswordResetRequestStatus { sent, notFound, failed }

class PasswordResetRequestResult {
  final PasswordResetRequestStatus status;
  final String message;
  const PasswordResetRequestResult(this.status, this.message);
}