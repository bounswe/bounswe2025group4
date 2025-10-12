// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get welcomeScreen_stayMotivated => 'ابق متحفزاً!';

  @override
  String get welcomeScreen_title => 'مرحباً بك في منصة الوظائف الأخلاقية';

  @override
  String get welcomeScreen_subtitle =>
      'تواصل مع الشركات التي تشاركك قيمك وابنِ مساراً وظيفياً أخلاقياً';

  @override
  String get welcomeScreen_getStarted => 'ابدأ';

  @override
  String get welcomeScreen_alreadyHaveAccount => 'لدي حساب بالفعل';

  @override
  String get signInScreen_title => 'تسجيل الدخول';

  @override
  String get signInScreen_welcomeBack => 'مرحباً بعودتك!';

  @override
  String get signInScreen_username => 'اسم المستخدم';

  @override
  String get signInScreen_password => 'كلمة المرور';

  @override
  String get signInScreen_usernameRequired => 'الرجاء إدخال اسم المستخدم';

  @override
  String get signInScreen_passwordRequired => 'الرجاء إدخال كلمة المرور';

  @override
  String get signInScreen_signInButton => 'تسجيل الدخول';

  @override
  String get signInScreen_dontHaveAccount => 'ليس لديك حساب؟';

  @override
  String get signInScreen_signUpLink => 'إنشاء حساب';

  @override
  String get signInScreen_loginFailed =>
      'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.';

  @override
  String get signUpScreen_title => 'إنشاء حساب';

  @override
  String get signUpScreen_createAccount => 'أنشئ حسابك';

  @override
  String get signUpScreen_username => 'اسم المستخدم';

  @override
  String get signUpScreen_email => 'البريد الإلكتروني';

  @override
  String get signUpScreen_password => 'كلمة المرور';

  @override
  String get signUpScreen_confirmPassword => 'تأكيد كلمة المرور';

  @override
  String get signUpScreen_bio => 'السيرة الذاتية';

  @override
  String get signUpScreen_usernameRequired => 'الرجاء إدخال اسم المستخدم';

  @override
  String get signUpScreen_emailRequired => 'الرجاء إدخال بريدك الإلكتروني';

  @override
  String get signUpScreen_emailInvalid => 'الرجاء إدخال بريد إلكتروني صالح';

  @override
  String get signUpScreen_passwordRequired => 'الرجاء إدخال كلمة المرور';

  @override
  String get signUpScreen_passwordTooShort =>
      'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل';

  @override
  String get signUpScreen_confirmPasswordRequired => 'الرجاء تأكيد كلمة المرور';

  @override
  String get signUpScreen_passwordsDoNotMatch => 'كلمات المرور غير متطابقة';

  @override
  String get signUpScreen_bioRequired => 'الرجاء إدخال السيرة الذاتية';

  @override
  String get signUpScreen_signUpButton => 'إنشاء حساب';

  @override
  String get signUpScreen_alreadyHaveAccount => 'هل لديك حساب بالفعل؟';

  @override
  String get signUpScreen_signInLink => 'تسجيل الدخول';

  @override
  String get signUpScreen_userTypeMissing =>
      'نوع المستخدم مفقود. يرجى إعادة بدء عملية التسجيل.';

  @override
  String get signUpScreen_signUpFailed =>
      'فشل التسجيل. يرجى المحاولة مرة أخرى لاحقاً.';

  @override
  String get signUpScreen_mentorProfileFailed =>
      'فشل إنشاء ملف المرشد. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.';

  @override
  String get signUpScreen_alreadyExists =>
      'اسم المستخدم أو البريد الإلكتروني موجود بالفعل.';

  @override
  String signUpScreen_registrationFailed(String error) {
    return 'فشل التسجيل: $error';
  }

  @override
  String get userTypeScreen_question => 'كيف ستستخدم منصتنا؟';

  @override
  String get userTypeScreen_jobSeeker => 'الباحث عن عمل';

  @override
  String get userTypeScreen_jobSeekerDesc =>
      'ابحث عن شركات وفرص أخلاقية تتوافق مع قيمك';

  @override
  String get userTypeScreen_employer => 'صاحب العمل';

  @override
  String get userTypeScreen_employerDesc =>
      'انشر الوظائف وابحث عن المرشحين الذين يشاركون قيم شركتك';

  @override
  String get userTypeScreen_continue => 'متابعة';

  @override
  String get mainScaffold_forum => 'المنتدى';

  @override
  String get mainScaffold_jobs => 'الوظائف';

  @override
  String get mainScaffold_mentorship => 'الإرشاد';

  @override
  String get mainScaffold_profile => 'الملف الشخصي';

  @override
  String get mainScaffold_workplaces => 'أماكن العمل';

  @override
  String get common_loading => 'جارٍ التحميل...';

  @override
  String get common_error => 'خطأ';

  @override
  String get common_retry => 'إعادة المحاولة';

  @override
  String get common_cancel => 'إلغاء';

  @override
  String get common_save => 'حفظ';

  @override
  String get common_delete => 'حذف';

  @override
  String get common_edit => 'تعديل';

  @override
  String get common_search => 'بحث';

  @override
  String get common_ok => 'موافق';

  @override
  String get common_yes => 'نعم';

  @override
  String get common_no => 'لا';

  @override
  String get profilePage_title => 'ملفي الشخصي';

  @override
  String get profilePage_editProfile => 'تعديل الملف الشخصي';

  @override
  String get profilePage_logout => 'تسجيل الخروج';

  @override
  String get profilePage_failedToLoad => 'فشل تحميل الملف الشخصي';

  @override
  String profilePage_fontSizeChanged(String size) {
    return 'تم تغيير حجم الخط إلى $size';
  }

  @override
  String profilePage_languageChanged(String language) {
    return 'تم تغيير اللغة إلى $language';
  }
}
