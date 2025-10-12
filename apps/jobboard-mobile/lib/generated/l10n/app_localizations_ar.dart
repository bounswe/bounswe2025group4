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

  @override
  String get careerStatusScreen_question => 'ما هي حالتك المهنية الحالية؟';

  @override
  String get careerStatusScreen_student => 'طالب';

  @override
  String get careerStatusScreen_recentGraduate => 'خريج حديث';

  @override
  String get careerStatusScreen_midLevel => 'محترف متوسط المستوى';

  @override
  String get careerStatusScreen_senior => 'محترف كبير';

  @override
  String get careerStatusScreen_changingCareers => 'تغيير المهنة';

  @override
  String get organizationTypeScreen_question => 'ما نوع المنظمة التي تمثلها؟';

  @override
  String get organizationTypeScreen_company => 'شركة';

  @override
  String get organizationTypeScreen_startup => 'شركة ناشئة';

  @override
  String get organizationTypeScreen_nonprofit => 'غير ربحية';

  @override
  String get organizationTypeScreen_freelancer => 'مستقل يوظف لمشروع';

  @override
  String get organizationTypeScreen_other => 'أخرى';

  @override
  String get organizationTypeScreen_pleaseSpecify => 'يرجى التحديد';

  @override
  String get jobPrioritiesScreen_question =>
      'ما هي أهم أولوياتك عند البحث عن وظيفة؟';

  @override
  String get jobPrioritiesScreen_selectAll => 'حدد كل ما ينطبق';

  @override
  String get jobPrioritiesScreen_fairWages => 'أجور عادلة';

  @override
  String get jobPrioritiesScreen_fairWagesDesc =>
      'الشركات التي تدفع أجوراً معيشية وتحافظ على ممارسات تعويض شفافة';

  @override
  String get jobPrioritiesScreen_inclusive => 'مكان عمل شامل';

  @override
  String get jobPrioritiesScreen_inclusiveDesc =>
      'المنظمات الملتزمة بالتنوع والمساواة والشمول';

  @override
  String get jobPrioritiesScreen_sustainability => 'الاستدامة/السياسات البيئية';

  @override
  String get jobPrioritiesScreen_sustainabilityDesc =>
      'الشركات ذات الالتزامات والممارسات البيئية القوية';

  @override
  String get jobPrioritiesScreen_workLife => 'التوازن بين العمل والحياة';

  @override
  String get jobPrioritiesScreen_workLifeDesc =>
      'احترام الوقت الشخصي مع خيارات جدولة مرنة';

  @override
  String get jobPrioritiesScreen_remote => 'صديق للعمل عن بُعد';

  @override
  String get jobPrioritiesScreen_remoteDesc =>
      'خيارات للعمل عن بُعد والموقع المرن';

  @override
  String get jobPrioritiesScreen_growth => 'فرص النمو الوظيفي';

  @override
  String get jobPrioritiesScreen_growthDesc =>
      'مسارات واضحة للتقدم والتطوير المهني';

  @override
  String get companyPoliciesScreen_question =>
      'ما هي السياسات الأخلاقية التي تتبعها شركتك؟';

  @override
  String get companyPoliciesScreen_fairWage => 'التزام الأجور العادلة';

  @override
  String get companyPoliciesScreen_fairWageDesc =>
      'ضمان تعويض تنافسي وممارسات دفع شفافة';

  @override
  String get companyPoliciesScreen_diversity => 'سياسة التنوع والشمول';

  @override
  String get companyPoliciesScreen_diversityDesc =>
      'تعزيز مكان عمل شامل مع فرص متساوية';

  @override
  String get companyPoliciesScreen_wellbeing => 'برامج رفاهية الموظفين';

  @override
  String get companyPoliciesScreen_wellbeingDesc =>
      'دعم الصحة النفسية والتوازن بين العمل والحياة والنمو الشخصي';

  @override
  String get companyPoliciesScreen_remotePolicy => 'ثقافة صديقة للعمل عن بُعد';

  @override
  String get companyPoliciesScreen_remotePolicyDesc =>
      'تقديم ترتيبات عمل مرنة وخيارات عن بُعد';

  @override
  String get companyPoliciesScreen_sustainabilityPolicy =>
      'أهداف الاستدامة/البيئة';

  @override
  String get companyPoliciesScreen_sustainabilityPolicyDesc =>
      'تنفيذ ممارسات صديقة للبيئة وتقليل التأثير البيئي';

  @override
  String get industrySelectionScreen_question =>
      'ما هي الصناعات الأكثر اهتماماً بها؟';

  @override
  String get industrySelectionScreen_tech => 'التكنولوجيا';

  @override
  String get industrySelectionScreen_healthcare => 'الرعاية الصحية';

  @override
  String get industrySelectionScreen_education => 'التعليم';

  @override
  String get industrySelectionScreen_finance => 'المالية';

  @override
  String get industrySelectionScreen_creativeArts => 'الفنون الإبداعية';

  @override
  String get mentorshipSelectionScreen_question =>
      'هل ترغب في المشاركة في نظام الإرشاد لدينا؟';

  @override
  String get mentorshipSelectionScreen_subtitle =>
      'يمكنك التواصل مع الآخرين لتلقي أو تقديم التوجيه المهني.';

  @override
  String get mentorshipSelectionScreen_beMentor => 'أريد أن أكون مرشداً';

  @override
  String get mentorshipSelectionScreen_beMentorDesc =>
      'ساعد الآخرين على تحسين سيرهم الذاتية ومساراتهم المهنية';

  @override
  String get mentorshipSelectionScreen_lookingForMentor =>
      'أبحث عن مرشد (متدرب)';

  @override
  String get mentorshipSelectionScreen_lookingForMentorDesc =>
      'احصل على ملاحظات وإرشادات للنمو مهنياً';

  @override
  String get mentorshipSelectionScreen_maxMentees =>
      'كم عدد المتدربين الذين ترغب في قبولهم؟';

  @override
  String get mentorshipSelectionScreen_maxMenteesLabel =>
      'الحد الأقصى لعدد المتدربين (1-20)';

  @override
  String get mentorshipSelectionScreen_enterNumber => 'الرجاء إدخال رقم';

  @override
  String get mentorshipSelectionScreen_validNumber => 'الرجاء إدخال رقم صحيح';

  @override
  String get mentorshipSelectionScreen_greaterThanZero =>
      'يجب أن يكون أكبر من 0';

  @override
  String get mentorshipSelectionScreen_lessThan21 => 'يجب أن يكون أقل من 21';

  @override
  String get jobPage_title => 'الوظائف';

  @override
  String get jobPage_search => 'البحث عن وظائف...';

  @override
  String get jobPage_filter => 'تصفية';

  @override
  String get jobPage_createJob => 'إنشاء إعلان وظيفة';

  @override
  String get jobPage_myApplications => 'طلباتي';

  @override
  String get jobPage_viewApplications => 'عرض الطلبات';

  @override
  String get jobPage_noJobs => 'لم يتم العثور على وظائف';

  @override
  String get jobPage_loadError => 'فشل تحميل الوظائف. يرجى المحاولة مرة أخرى.';

  @override
  String get jobPage_posted => 'نُشر';

  @override
  String get jobPage_remote => 'عن بُعد';

  @override
  String get jobPage_yourPostedJobs => 'الوظائف التي نشرتها';

  @override
  String get jobPage_noPostedJobs => 'لم تنشر أي وظائف بعد.';

  @override
  String get jobDetails_title => 'تفاصيل الوظيفة';

  @override
  String get jobDetails_apply => 'قدم الآن';

  @override
  String get jobDetails_loadError =>
      'فشل تحميل تفاصيل الوظيفة. يرجى المحاولة مرة أخرى.';

  @override
  String get jobDetails_applyError => 'خطأ: تعذر تحديد المستخدم.';

  @override
  String jobDetails_applySuccess(String jobTitle) {
    return 'تم التقديم بنجاح إلى $jobTitle';
  }

  @override
  String get jobDetails_company => 'الشركة';

  @override
  String get jobDetails_location => 'الموقع';

  @override
  String get jobDetails_salary => 'الراتب';

  @override
  String get jobDetails_description => 'الوصف';

  @override
  String get jobDetails_requirements => 'المتطلبات';

  @override
  String get jobDetails_ethicalTags => 'العلامات الأخلاقية';

  @override
  String get jobDetails_notFound => 'لم يتم العثور على تفاصيل الوظيفة.';

  @override
  String get jobDetails_noTags => 'لا توجد علامات محددة.';

  @override
  String get jobDetails_salaryRange => 'نطاق الراتب';

  @override
  String get jobDetails_contactInfo => 'معلومات الاتصال';

  @override
  String get jobDetails_applying => 'جارٍ التقديم...';

  @override
  String get forumPage_title => 'المنتدى';

  @override
  String get forumPage_loadError =>
      'فشل تحميل المنتدى: يرجى التحقق من اتصالك والمحاولة مرة أخرى.';

  @override
  String get forumPage_noDiscussions => 'لا توجد مناقشات بعد';

  @override
  String get forumPage_filter => 'تصفية';

  @override
  String get forumPage_searchTags => 'البحث عن العلامات';

  @override
  String get forumPage_reset => 'إعادة تعيين';

  @override
  String get createThread_newTitle => 'مناقشة جديدة';

  @override
  String get createThread_editTitle => 'تعديل المناقشة';

  @override
  String get createThread_titleLabel => 'العنوان';

  @override
  String get createThread_titleRequired => 'الرجاء إدخال عنوان';

  @override
  String get createThread_titleMaxLength =>
      'يجب أن يكون العنوان 100 حرف على الأكثر';

  @override
  String get createThread_bodyLabel => 'ما الذي يدور في ذهنك؟';

  @override
  String get createThread_bodyRequired => 'الرجاء إدخال المحتوى';

  @override
  String get createThread_tags => 'العلامات';

  @override
  String get createThread_selectTags => 'اختر العلامات';

  @override
  String get createThread_suggestTags => 'اقترح العلامات';

  @override
  String get createThread_enterTitleForSuggestions =>
      'الرجاء إدخال عنوان للحصول على اقتراحات العلامات.';

  @override
  String get createThread_addNewTag => 'إضافة علامة جديدة';

  @override
  String get createThread_tagEmpty => 'اسم العلامة لا يمكن أن يكون فارغًا.';

  @override
  String get createThread_tagMaxLength =>
      'يجب أن يكون اسم العلامة 255 حرفًا على الأكثر.';

  @override
  String get createThread_done => 'تم';

  @override
  String get createThread_post => 'نشر';

  @override
  String get createThread_save => 'حفظ';

  @override
  String get createThread_createError =>
      'فشل إنشاء/تعديل المناقشة. يرجى التحقق من اتصالك.';

  @override
  String get createThread_generalError => 'فشل إنشاء/تعديل المناقشة.';

  @override
  String get threadDetail_report => 'إبلاغ';

  @override
  String get threadDetail_edit => 'تعديل';

  @override
  String get threadDetail_delete => 'حذف';

  @override
  String get threadDetail_reported => 'تم الإبلاغ عن المناقشة';

  @override
  String get threadDetail_connectionError =>
      'فشل: يرجى التحقق من اتصالك وتحديث الصفحة.';

  @override
  String get threadDetail_unavailable => 'فشل: هذه المناقشة لم تعد متاحة.';

  @override
  String get threadDetail_deleteError => 'فشل حذف المناقشة.';

  @override
  String get threadDetail_threadDetails => 'تفاصيل المناقشة';

  @override
  String get threadDetail_creator => 'المُنشئ: ';

  @override
  String get threadDetail_content => 'المحتوى:';

  @override
  String get threadDetail_tags => 'العلامات:';

  @override
  String threadDetail_created(String date) {
    return 'تم الإنشاء: $date';
  }

  @override
  String threadDetail_edited(String date) {
    return 'تم التعديل: $date';
  }

  @override
  String get threadDetail_comments => 'التعليقات';

  @override
  String get threadDetail_addComment => 'أضف تعليقاً…';

  @override
  String get threadDetail_commentRequired => 'الرجاء إدخال تعليق';

  @override
  String get threadDetail_deleteCommentError => 'فشل حذف التعليق.';

  @override
  String get common_notSpecified => 'غير محدد';

  @override
  String common_upTo(String amount) {
    return 'حتى $amount';
  }

  @override
  String common_from(String amount) {
    return 'من $amount';
  }
}
