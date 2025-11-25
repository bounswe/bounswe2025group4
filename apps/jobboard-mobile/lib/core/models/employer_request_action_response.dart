/// Model for employer request action response
class EmployerRequestActionResponse {
  final String? action;

  EmployerRequestActionResponse({this.action});

  factory EmployerRequestActionResponse.fromJson(Map<String, dynamic> json) {
    return EmployerRequestActionResponse(action: json['action'] as String?);
  }

  Map<String, dynamic> toJson() {
    return {if (action != null) 'action': action};
  }
}
