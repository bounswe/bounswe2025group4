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
      'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل';

  @override
  String get signUpScreen_passwordNoUppercase =>
      'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل';

  @override
  String get signUpScreen_passwordNoLowercase =>
      'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل';

  @override
  String get signUpScreen_passwordNoNumber =>
      'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل';

  @override
  String get signUpScreen_passwordNoSpecialChar =>
      'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل';

  @override
  String get signUpScreen_confirmPasswordRequired => 'الرجاء تأكيد كلمة المرور';

  @override
  String get signUpScreen_passwordsDoNotMatch => 'كلمات المرور غير متطابقة';

  @override
  String get signUpScreen_gender => 'الجنس';

  @override
  String get signUpScreen_male => 'ذكر';

  @override
  String get signUpScreen_female => 'أنثى';

  @override
  String get signUpScreen_other => 'آخر';

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
  String get jobDetails_alreadyApplied => 'لقد تقدمت بالفعل لهذه الوظيفة.';

  @override
  String jobDetails_cvUploadFailed(String error) {
    return 'تم تقديم الطلب ولكن فشل رفع السيرة الذاتية: $error';
  }

  @override
  String jobDetails_applyErrorGeneric(String error) {
    return 'خطأ في التقديم: $error';
  }

  @override
  String get jobDetails_applyDialogTitle => 'التقديم للوظيفة';

  @override
  String jobDetails_applyDialogMessage(String jobTitle) {
    return 'أنت تتقدم لـ: $jobTitle';
  }

  @override
  String get jobDetails_cvLabel => 'رفع السيرة الذاتية *';

  @override
  String get jobDetails_cvPlaceholder => 'اختر ملف (PDF, DOC, DOCX)';

  @override
  String get jobDetails_coverLetterLabel => 'خطاب التغطية (اختياري)';

  @override
  String get jobDetails_coverLetterHint =>
      'اشرح لماذا أنت مناسب تماماً لهذا المنصب...';

  @override
  String get jobDetails_specialNeedsLabel =>
      'الاحتياجات الخاصة أو التسهيلات (اختياري)';

  @override
  String get jobDetails_specialNeedsHint =>
      'مثل: إمكانية الوصول للكراسي المتحركة، ساعات مرنة...';

  @override
  String get jobDetails_specialNeedsMessage =>
      'ستساعد هذه المعلومات أصحاب العمل على تلبية احتياجاتك.';

  @override
  String get jobDetails_cancelButton => 'إلغاء';

  @override
  String get jobDetails_submitButton => 'تقديم الطلب';

  @override
  String get jobDetails_checkingStatus => 'جارٍ التحقق...';

  @override
  String get jobDetails_alreadyAppliedButton => 'تم التقديم بالفعل';

  @override
  String get jobDetails_remote => 'عن بُعد';

  @override
  String get jobDetails_inclusiveOpportunity => 'فرصة شاملة';

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
  String get mentorshipPage_title => 'الترابط المهني';

  @override
  String get mentorshipPage_loginRequired =>
      'الرجاء تسجيل الدخول للوصول إلى ميزات الترابط المهني.';

  @override
  String get mentorScreen_title => 'الترابط المهني';

  @override
  String get mentorScreen_currentMentees => 'المنتسبون الحاليون';

  @override
  String get mentorScreen_requests => 'الطلبات';

  @override
  String mentorScreen_currentCapacity(int capacity) {
    return 'السعة الحالية: $capacity';
  }

  @override
  String get mentorScreen_updateCapacity => 'تحديث السعة';

  @override
  String get mentorScreen_noCurrentMentees => 'لا يوجد منتسبون حاليون';

  @override
  String get mentorScreen_noPendingRequests => 'لا توجد طلبات معلقة';

  @override
  String get mentorScreen_capacityUpdated => 'تم تحديث السعة بنجاح';

  @override
  String get mentorScreen_requestAccepted => 'تم قبول الطلب';

  @override
  String get mentorScreen_requestRejected => 'تم رفض الطلب';

  @override
  String get mentorScreen_mentorshipCompleted =>
      'تم إكمال الترابط المهني بنجاح';

  @override
  String get mentorScreen_mentorshipCancelled =>
      'تم إلغاء الترابط المهني بنجاح';

  @override
  String mentorScreen_openChat(String menteeName) {
    return 'فتح الدردشة مع $menteeName';
  }

  @override
  String get mentorScreen_updateCapacityTitle =>
      'تحديث الحد الأقصى لسعة المنتسبين';

  @override
  String get mentorScreen_maxMentees => 'الحد الأقصى لعدد المنتسبين';

  @override
  String get mentorScreen_enterNumber => 'أدخل رقماً';

  @override
  String get mentorScreen_cancel => 'إلغاء';

  @override
  String get mentorScreen_update => 'تحديث';

  @override
  String get mentorScreen_completeMentorship => 'إكمال الترابط المهني';

  @override
  String get mentorScreen_cancelMentorship => 'إلغاء الترابط المهني';

  @override
  String mentorScreen_confirmComplete(String menteeName) {
    return 'هل أنت متأكد من أنك تريد إكمال الترابط المهني مع $menteeName؟\n\nسيؤدي هذا إلى تمييز الترابط المهني كمكتمل بنجاح.';
  }

  @override
  String mentorScreen_confirmCancel(String menteeName) {
    return 'هل أنت متأكد من أنك تريد إلغاء الترابط المهني مع $menteeName؟\n\nسيؤدي هذا إلى إنهاء علاقة الترابط المهني.';
  }

  @override
  String get mentorScreen_confirm => 'تأكيد';

  @override
  String get menteeScreen_findMentors => 'البحث عن المرشدين';

  @override
  String get menteeScreen_myMentorships => 'ترابطاتي المهنية';

  @override
  String get menteeScreen_searchMentors =>
      'البحث عن المرشدين بالاسم، الدور، الشركة...';

  @override
  String get menteeScreen_noMentorsFound => 'لم يتم العثور على مرشدين.';

  @override
  String menteeScreen_errorLoadingMentors(String error) {
    return 'خطأ في تحميل المرشدين: $error';
  }

  @override
  String get menteeScreen_retryLoadingMentors => 'إعادة تحميل المرشدين';

  @override
  String menteeScreen_requestMentorshipTitle(String mentorName) {
    return 'طلب ترابط مهني من $mentorName';
  }

  @override
  String get menteeScreen_provideMessage =>
      'الرجاء تقديم رسالة لطلب الترابط المهني:';

  @override
  String get menteeScreen_messageHint => 'أريدك أن تكون مرشدي لأن...';

  @override
  String get menteeScreen_sendRequest => 'إرسال الطلب';

  @override
  String get menteeScreen_messageMinLength =>
      'الرجاء إدخال رسالة من 10 أحرف على الأقل';

  @override
  String menteeScreen_requestSent(String mentorName) {
    return 'تم طلب الترابط المهني لـ $mentorName';
  }

  @override
  String get menteeScreen_requestError => 'حدث خطأ أثناء الطلب';

  @override
  String get menteeScreen_pendingRequests => 'الطلبات المعلقة';

  @override
  String get menteeScreen_activeMentorships => 'الترابطات المهنية النشطة';

  @override
  String get menteeScreen_noPendingRequests => 'لا توجد طلبات معلقة.';

  @override
  String get menteeScreen_noActiveMentorships => 'لا توجد ترابطات مهنية نشطة.';

  @override
  String menteeScreen_error(String error) {
    return 'خطأ: $error';
  }

  @override
  String mentorProfile_title(String mentorName) {
    return 'ملف المرشد: $mentorName';
  }

  @override
  String mentorProfile_loadError(String error) {
    return 'فشل تحميل ملف المرشد أو المراجعات: $error';
  }

  @override
  String get mentorProfile_noProfileData => 'لا توجد بيانات ملف متاحة';

  @override
  String get mentorProfile_rateMentor => 'تقييم هذا المرشد';

  @override
  String mentorProfile_atCompany(String company) {
    return 'في $company';
  }

  @override
  String get mentorProfile_rating => 'التقييم';

  @override
  String mentorProfile_reviews(int count) {
    return '$count مراجعة';
  }

  @override
  String get mentorProfile_mentorshipInfo => 'معلومات الترابط المهني';

  @override
  String get mentorProfile_capacity => 'السعة';

  @override
  String mentorProfile_mentees(int current, int max) {
    return '$current/$max منتسب';
  }

  @override
  String get mentorProfile_status => 'الحالة';

  @override
  String get mentorProfile_available => 'متاح للترابط المهني';

  @override
  String get mentorProfile_notAvailable => 'غير متاح للترابط المهني';

  @override
  String get mentorProfile_about => 'حول';

  @override
  String get mentorProfile_noReviews => 'لا توجد مراجعات بعد.';

  @override
  String mentorProfile_byUser(String username) {
    return 'بواسطة: $username';
  }

  @override
  String mentorProfile_rateTitle(String mentorName) {
    return 'تقييم $mentorName';
  }

  @override
  String get mentorProfile_selectRating => 'اختر تقييماً:';

  @override
  String get mentorProfile_commentOptional => 'تعليق (اختياري)';

  @override
  String get mentorProfile_submitting => 'جاري الإرسال...';

  @override
  String get mentorProfile_submit => 'إرسال';

  @override
  String get mentorProfile_selectRatingError => 'الرجاء اختيار تقييم';

  @override
  String get mentorProfile_ratingSubmitted => 'تم إرسال التقييم بنجاح';

  @override
  String mentorProfile_ratingError(String error) {
    return 'خطأ في إرسال التقييم: $error';
  }

  @override
  String directMessage_title(String mentorName) {
    return '$mentorName';
  }

  @override
  String get directMessage_attachFile => 'إرفاق ملف';

  @override
  String get directMessage_typeMessage => 'اكتب رسالة...';

  @override
  String get directMessage_sendMessage => 'إرسال رسالة';

  @override
  String get directMessage_fileNotImplemented =>
      'إرفاق الملفات لم يتم تطبيقه بعد.';

  @override
  String get createJob_title => 'إنشاء إعلان وظيفة جديد';

  @override
  String get createJob_jobDetails => 'تفاصيل الوظيفة';

  @override
  String get createJob_jobTitle => 'عنوان الوظيفة';

  @override
  String get createJob_jobTitleRequired => 'الرجاء إدخال عنوان الوظيفة';

  @override
  String get createJob_company => 'الشركة';

  @override
  String get createJob_companyHint => 'اسم شركتك';

  @override
  String get createJob_companyRequired => 'الرجاء إدخال اسم الشركة';

  @override
  String get createJob_location => 'الموقع (مثل: المدينة، الولاية، البلد)';

  @override
  String get createJob_locationRequired => 'الرجاء إدخال موقع';

  @override
  String get createJob_remoteJob => 'وظيفة عن بُعد';

  @override
  String get createJob_description => 'وصف الوظيفة';

  @override
  String get createJob_descriptionRequired => 'الرجاء إدخال وصف الوظيفة';

  @override
  String get createJob_jobType => 'نوع الوظيفة';

  @override
  String get createJob_selectJobType => 'اختر نوع الوظيفة';

  @override
  String get createJob_jobTypeRequired => 'الرجاء اختيار نوع الوظيفة';

  @override
  String get createJob_contactInfo =>
      'معلومات الاتصال (البريد الإلكتروني/الهاتف/الرابط)';

  @override
  String get createJob_contactInfoRequired => 'الرجاء تقديم معلومات الاتصال';

  @override
  String get createJob_minSalary => 'الحد الأدنى للراتب (اختياري)';

  @override
  String get createJob_minSalaryHint => 'مثل: 50000';

  @override
  String get createJob_maxSalary => 'الحد الأقصى للراتب (اختياري)';

  @override
  String get createJob_maxSalaryHint => 'مثل: 70000';

  @override
  String get createJob_validNumber => 'الرجاء إدخال رقم صحيح';

  @override
  String get createJob_invalidFormat =>
      'تنسيق رقم غير صحيح (نقاط عشرية كثيرة جداً)';

  @override
  String get createJob_maxSalaryError =>
      'الحد الأقصى للراتب يجب أن يكون >= الحد الأدنى للراتب';

  @override
  String get createJob_ethicalPolicies => 'الامتثال للسياسات الأخلاقية';

  @override
  String get createJob_creatingPost => 'جاري إنشاء الإعلان...';

  @override
  String get createJob_createPost => 'إنشاء إعلان وظيفة';

  @override
  String get createJob_selectJobTypeError => 'الرجاء اختيار نوع الوظيفة.';

  @override
  String get createJob_selectPolicyError =>
      'الرجاء اختيار سياسة أخلاقية واحدة على الأقل.';

  @override
  String get createJob_selectWorkplace => 'Select Workplace';

  @override
  String get createJob_workplaceRequired => 'Please select a workplace';

  @override
  String get createJob_selectWorkplaceError =>
      'Please select a workplace to post the job';

  @override
  String get createJob_nonProfitLabel => 'Non-Profit / Volunteer Position';

  @override
  String get createJob_nonProfitSubtitle =>
      'This is a volunteer or non-profit position (no salary)';

  @override
  String get createJob_noWorkplacesTitle => 'No Workplaces Found';

  @override
  String get createJob_noWorkplacesMessage =>
      'You need to create or join a workplace before you can post job openings. Create your first workplace to get started!';

  @override
  String get createJob_createWorkplace => 'Create Workplace';

  @override
  String get createJob_employerError =>
      'خطأ: لا يمكن التحقق من حساب صاحب العمل.';

  @override
  String get createJob_invalidMinSalary =>
      'تنسيق الحد الأدنى للراتب غير صحيح. الرجاء إدخال أرقام فقط.';

  @override
  String get createJob_invalidMaxSalary =>
      'تنسيق الحد الأقصى للراتب غير صحيح. الرجاء إدخال أرقام فقط.';

  @override
  String get createJob_salaryRangeError =>
      'الحد الأدنى للراتب لا يمكن أن يكون أكبر من الحد الأقصى للراتب.';

  @override
  String createJob_success(String jobTitle) {
    return 'تم إنشاء الوظيفة \"$jobTitle\" بنجاح!';
  }

  @override
  String createJob_error(String error) {
    return 'خطأ في إنشاء الوظيفة: $error';
  }

  @override
  String get createJob_invalidMinSalaryFormat =>
      'تنسيق الحد الأدنى للراتب غير صحيح. الرجاء إدخال أرقام كاملة فقط.';

  @override
  String get createJob_invalidMaxSalaryFormat =>
      'تنسيق الحد الأقصى للراتب غير صحيح. الرجاء إدخال أرقام كاملة فقط.';

  @override
  String get createJob_salaryRangeInvalid =>
      'الحد الأدنى للراتب لا يمكن أن يكون أكبر من الحد الأقصى للراتب.';

  @override
  String get createJob_companyNameRequired => 'الرجاء إدخال اسم الشركة';

  @override
  String get createJob_locationLabel => 'الموقع (مثل: المدينة، الولاية، البلد)';

  @override
  String get createJob_locationRequiredError => 'الرجاء إدخال موقع';

  @override
  String get createJob_remoteLabel => 'وظيفة عن بُعد';

  @override
  String get createJob_inclusiveLabel => 'فرصة شاملة';

  @override
  String get createJob_inclusiveSubtitle =>
      'هذا المنصب مفتوح للمجموعات الممثلة تمثيلاً ناقصاً';

  @override
  String get createJob_descriptionLabel => 'وصف الوظيفة';

  @override
  String get createJob_descriptionRequiredError => 'الرجاء إدخال وصف الوظيفة';

  @override
  String get createJob_contactLabel =>
      'معلومات الاتصال (البريد الإلكتروني/الهاتف/الرابط)';

  @override
  String get createJob_contactRequiredError => 'الرجاء تقديم معلومات الاتصال';

  @override
  String get createJob_minSalaryLabel => 'الحد الأدنى للراتب (اختياري)';

  @override
  String get createJob_minSalaryPlaceholder => 'مثل: 50000';

  @override
  String get createJob_maxSalaryLabel => 'الحد الأقصى للراتب (اختياري)';

  @override
  String get createJob_maxSalaryPlaceholder => 'مثل: 70000';

  @override
  String get createJob_validNumberError => 'الرجاء إدخال رقم صحيح كامل';

  @override
  String get createJob_ethicalPoliciesLabel => 'الامتثال للسياسات الأخلاقية';

  @override
  String createJob_policiesSelected(int count) {
    return '$count محدد';
  }

  @override
  String get jobApplications_title => 'طلبات الوظائف';

  @override
  String get jobApplications_userError =>
      'المستخدم غير مسجل الدخول أو لم يتم العثور على معرف المستخدم.';

  @override
  String get jobApplications_loadError =>
      'فشل تحميل الطلبات. الرجاء المحاولة مرة أخرى.';

  @override
  String get jobApplications_noApplications =>
      'لم يتم استلام أي طلبات لهذه الوظيفة بعد.';

  @override
  String jobApplications_applied(String date) {
    return 'تم التقديم: $date';
  }

  @override
  String jobApplications_feedback(String feedback) {
    return 'التعليقات: $feedback';
  }

  @override
  String get jobApplications_reject => 'رفض';

  @override
  String get jobApplications_approve => 'موافقة';

  @override
  String jobApplications_statusUpdated(String status) {
    return 'تم $status الطلب.';
  }

  @override
  String jobApplications_updateError(String error) {
    return 'خطأ في تحديث الحالة: $error';
  }

  @override
  String jobApplications_feedbackTitle(String action) {
    return 'تقديم تعليقات (اختياري) لـ $action';
  }

  @override
  String get jobApplications_feedbackHint => 'أدخل التعليقات هنا...';

  @override
  String get jobApplications_submit => 'إرسال';

  @override
  String get jobApplications_approveDialogTitle => 'الموافقة على الطلب';

  @override
  String get jobApplications_rejectDialogTitle => 'رفض الطلب';

  @override
  String get jobApplications_approveFeedbackPrompt =>
      'تقديم تعليقات للمتقدم (اختياري):';

  @override
  String get jobApplications_rejectFeedbackPrompt =>
      'تقديم سبب الرفض (اختياري):';

  @override
  String get jobApplications_approveFeedbackHint =>
      'مثل: مؤهلات رائعة! سنتواصل معك قريباً.';

  @override
  String get jobApplications_rejectFeedbackHint =>
      'مثل: لقد اخترنا مرشحين آخرين في هذا الوقت.';

  @override
  String get jobApplications_feedbackMessage => 'سيرى المتقدم هذه التعليقات.';

  @override
  String get jobApplications_cancelButton => 'إلغاء';

  @override
  String get jobApplications_approveButton => 'موافقة';

  @override
  String get jobApplications_rejectButton => 'رفض';

  @override
  String get jobApplications_approvedSuccess => 'تمت الموافقة على الطلب بنجاح';

  @override
  String get jobApplications_rejectedSuccess => 'تم رفض الطلب';

  @override
  String get jobApplications_statusUpdatedSuccess => 'تم تحديث حالة الطلب';

  @override
  String jobApplications_appliedLabel(String date) {
    return 'تم التقديم: $date';
  }

  @override
  String jobApplications_specialNeedsLabel(String needs) {
    return 'احتياجات خاصة: $needs';
  }

  @override
  String get jobApplications_cvLabel => 'السيرة الذاتية مرفقة (اضغط للعرض)';

  @override
  String get jobApplications_coverLetterLabel => 'خطاب التغطية';

  @override
  String jobApplications_feedbackLabel(String feedback) {
    return 'التعليقات: $feedback';
  }

  @override
  String get jobApplications_downloadingCV => 'جارٍ تنزيل السيرة الذاتية...';

  @override
  String jobApplications_cvSaved(String path) {
    return 'تم حفظ السيرة الذاتية في: $path';
  }

  @override
  String jobApplications_cvDownloadFailed(String error) {
    return 'فشل تنزيل السيرة الذاتية: $error';
  }

  @override
  String get jobApplications_noCVUploaded => 'لم يتم رفع سيرة ذاتية لهذا الطلب';

  @override
  String get jobApplications_viewCVBrowser => 'عرض السيرة الذاتية في المتصفح';

  @override
  String get jobApplications_viewCVBrowserSubtitle =>
      'افتح السيرة الذاتية في متصفحك';

  @override
  String get jobApplications_cvOpenFailed =>
      'تعذر فتح السيرة الذاتية. لا يوجد تطبيق متاح للتعامل مع ملفات PDF.';

  @override
  String jobApplications_cvOpenError(String error) {
    return 'خطأ في فتح السيرة الذاتية: $error';
  }

  @override
  String get jobApplications_statusPending => 'قيد الانتظار';

  @override
  String get jobApplications_statusApproved => 'مقبول';

  @override
  String get jobApplications_statusRejected => 'مرفوض';

  @override
  String get jobApplications_downloadCV => 'تنزيل السيرة الذاتية';

  @override
  String get jobApplications_downloadCVSubtitle =>
      'حفظ السيرة الذاتية على جهازك';

  @override
  String jobApplications_cvDownloadedSuccess(String path) {
    return 'تم تنزيل السيرة الذاتية بنجاح\n$path';
  }

  @override
  String get jobApplications_openButton => 'فتح';

  @override
  String get jobFilter_title => 'تصفية الوظائف';

  @override
  String get jobFilter_jobTitle => 'عنوان الوظيفة';

  @override
  String get jobFilter_jobTitleHint => 'أدخل بادئة عنوان الوظيفة';

  @override
  String get jobFilter_companyName => 'اسم الشركة';

  @override
  String get jobFilter_companyNameHint => 'أدخل بادئة اسم الشركة';

  @override
  String get jobFilter_ethicalPolicies => 'السياسات الأخلاقية';

  @override
  String get jobFilter_minSalary => 'الحد الأدنى للراتب';

  @override
  String get jobFilter_minSalaryHint => 'مثل: 30000';

  @override
  String get jobFilter_maxSalary => 'الحد الأقصى للراتب';

  @override
  String get jobFilter_maxSalaryHint => 'مثل: 100000';

  @override
  String get jobFilter_remoteOnly => 'الوظائف عن بُعد فقط';

  @override
  String get jobFilter_inclusiveOpportunity =>
      'وظائف شاملة للأشخاص ذوي الإعاقة فقط';

  @override
  String get jobFilter_jobType => 'نوع الوظيفة';

  @override
  String get jobFilter_clearAll => 'مسح الكل';

  @override
  String get jobFilter_applyFilters => 'تطبيق المرشحات';

  @override
  String get myApplications_title => 'طلبات الوظائف الخاصة بي';

  @override
  String get myApplications_userError =>
      'خطأ: لم يتم العثور على المستخدم. لا يمكن تحميل الطلبات.';

  @override
  String get myApplications_loadError =>
      'فشل تحميل الطلبات. الرجاء المحاولة مرة أخرى.';

  @override
  String get myApplications_noApplications => 'لم تتقدم لأي وظيفة بعد.';

  @override
  String myApplications_applied(String date) {
    return 'تم التقديم: $date';
  }

  @override
  String myApplications_specialNeeds(String specialNeeds) {
    return 'الاحتياجات الخاصة: $specialNeeds';
  }

  @override
  String myApplications_feedback(String feedback) {
    return 'التعليقات: $feedback';
  }

  @override
  String myApplications_feedbackTitle(String jobTitle) {
    return 'تعليقات لـ $jobTitle';
  }

  @override
  String get myApplications_close => 'إغلاق';

  @override
  String get workplaces_title => 'أماكن العمل';

  @override
  String workplaces_reviews(int count) {
    return '$count مراجعة';
  }

  @override
  String get editProfile_title => 'تعديل الملف الشخصي';

  @override
  String get editProfile_saveChanges => 'حفظ التغييرات';

  @override
  String get editProfile_personalInfo => 'المعلومات الشخصية';

  @override
  String get editProfile_fullName => 'الاسم الكامل';

  @override
  String get editProfile_bio => 'السيرة الذاتية';

  @override
  String get editProfile_location => 'الموقع';

  @override
  String get editProfile_phone => 'الهاتف';

  @override
  String get editProfile_occupation => 'المهنة';

  @override
  String get editProfile_accountInfo => 'معلومات الحساب';

  @override
  String get editProfile_username => 'اسم المستخدم';

  @override
  String get editProfile_email => 'البريد الإلكتروني';

  @override
  String get editProfile_workExperience => 'الخبرة العملية';

  @override
  String get editProfile_education => 'التعليم';

  @override
  String get editProfile_addWorkExperience => 'إضافة خبرة عمل';

  @override
  String get editProfile_addEducation => 'إضافة تعليم';

  @override
  String get userProfile_title => 'الملف الشخصي للمستخدم';

  @override
  String get userProfile_loadError => 'فشل تحميل الملف الشخصي للمستخدم';

  @override
  String get userProfile_tryAgain => 'حاول مرة أخرى';

  @override
  String get userProfile_workExperience => 'الخبرة العملية';

  @override
  String get userProfile_education => 'التعليم';

  @override
  String get userProfile_noWorkExperience => 'لم يتم إضافة خبرة عمل بعد';

  @override
  String get userProfile_noEducation => 'لم يتم إضافة تعليم بعد';

  @override
  String get userProfile_skills => 'المهارات';

  @override
  String get userProfile_interests => 'الاهتمامات';

  @override
  String profilePage_username(String username) {
    return 'اسم المستخدم: $username';
  }

  @override
  String profilePage_email(String email) {
    return 'البريد الإلكتروني: $email';
  }

  @override
  String get profilePage_skills => 'المهارات';

  @override
  String get profilePage_noSkills => 'لم يتم إضافة مهارات بعد.';

  @override
  String get profilePage_addSkill => 'إضافة مهارة';

  @override
  String get profilePage_enterSkill => 'أدخل مهارة';

  @override
  String get profilePage_interests => 'الاهتمامات';

  @override
  String get profilePage_noInterests => 'لم يتم إضافة اهتمامات بعد.';

  @override
  String get profilePage_addInterest => 'إضافة اهتمام';

  @override
  String get profilePage_enterInterest => 'أدخل اهتمام';

  @override
  String get profilePage_theme => 'السمة';

  @override
  String get profilePage_lightMode => 'فاتح';

  @override
  String get profilePage_darkMode => 'داكن';

  @override
  String get profilePage_systemMode => 'النظام';

  @override
  String profilePage_themeChanged(String theme) {
    return 'تم تغيير السمة إلى $theme';
  }

  @override
  String get profilePage_fontSize => 'حجم الخط';

  @override
  String get profilePage_small => 'صغير';

  @override
  String get profilePage_medium => 'متوسط';

  @override
  String get profilePage_large => 'كبير';

  @override
  String get profilePage_language => 'Language / Dil / اللغة';

  @override
  String get profileWidgets_education => 'التعليم';

  @override
  String get profileWidgets_add => 'إضافة';

  @override
  String get profileWidgets_noEducation => 'لم يتم إضافة تاريخ تعليمي بعد.';

  @override
  String get profileWidgets_deleteEducation => 'حذف التعليم';

  @override
  String profileWidgets_confirmDeleteEducation(String school) {
    return 'هل أنت متأكد من أنك تريد حذف تعليمك في $school؟';
  }

  @override
  String get profileWidgets_cancel => 'إلغاء';

  @override
  String get profileWidgets_delete => 'حذف';

  @override
  String get profileWidgets_workExperience => 'الخبرة العملية';

  @override
  String get profileWidgets_noWorkExperience => 'لم يتم إضافة خبرة عمل بعد.';

  @override
  String get profileWidgets_deleteExperience => 'حذف الخبرة';

  @override
  String profileWidgets_confirmDeleteExperience(String company) {
    return 'هل أنت متأكد من أنك تريد حذف خبرتك في $company؟';
  }

  @override
  String get educationDialog_addTitle => 'إضافة تعليم';

  @override
  String get educationDialog_editTitle => 'تعديل التعليم';

  @override
  String get educationDialog_school => 'المدرسة/الجامعة';

  @override
  String get educationDialog_schoolRequired => 'الرجاء إدخال اسم المدرسة';

  @override
  String get educationDialog_degree => 'الدرجة';

  @override
  String get educationDialog_degreeRequired => 'الرجاء إدخال درجة';

  @override
  String get educationDialog_field => 'مجال الدراسة';

  @override
  String get educationDialog_fieldRequired => 'الرجاء إدخال مجال الدراسة';

  @override
  String get educationDialog_startDate => 'تاريخ البداية (شهر/سنة)';

  @override
  String get educationDialog_startDateRequired => 'الرجاء إدخال تاريخ البداية';

  @override
  String get educationDialog_currentlyStudying => 'أدرس حالياً هنا';

  @override
  String get educationDialog_endDate => 'تاريخ النهاية (شهر/سنة)';

  @override
  String get educationDialog_endDateRequired => 'الرجاء إدخال تاريخ النهاية';

  @override
  String get educationDialog_save => 'حفظ';

  @override
  String get workExperienceDialog_addTitle => 'إضافة خبرة عمل';

  @override
  String get workExperienceDialog_editTitle => 'تعديل الخبرة العملية';

  @override
  String get workExperienceDialog_company => 'الشركة';

  @override
  String get workExperienceDialog_companyRequired => 'الرجاء إدخال اسم الشركة';

  @override
  String get workExperienceDialog_position => 'المنصب';

  @override
  String get workExperienceDialog_positionRequired => 'الرجاء إدخال المنصب';

  @override
  String get workExperienceDialog_startDate => 'تاريخ البداية (شهر/سنة)';

  @override
  String get workExperienceDialog_startDateRequired =>
      'الرجاء إدخال تاريخ البداية';

  @override
  String get workExperienceDialog_currentlyWorking => 'أعمل حالياً هنا';

  @override
  String get workExperienceDialog_endDate => 'تاريخ النهاية (شهر/سنة)';

  @override
  String get workExperienceDialog_endDateRequired =>
      'الرجاء إدخال تاريخ النهاية';

  @override
  String get workExperienceDialog_description => 'الوصف';

  @override
  String get workExperienceDialog_descriptionRequired => 'الرجاء إدخال وصف';

  @override
  String get workExperienceDialog_save => 'حفظ';

  @override
  String get badges_title => 'الإنجازات والشارات';

  @override
  String get badges_noBadges => 'لم يتم كسب أي شارات بعد.';

  @override
  String badges_earned(String date) {
    return 'تم كسبها في $date';
  }

  @override
  String get badges_today => 'اليوم';

  @override
  String get badges_yesterday => 'أمس';

  @override
  String badges_daysAgo(int days) {
    return 'منذ $days أيام';
  }

  @override
  String badges_monthsAgo(int months, String monthText) {
    return 'منذ $months $monthText';
  }

  @override
  String badges_yearsAgo(int years, String yearText) {
    return 'منذ $years $yearText';
  }

  @override
  String get badges_month => 'شهر';

  @override
  String get badges_months => 'أشهر';

  @override
  String get badges_year => 'سنة';

  @override
  String get badges_years => 'سنوات';

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

  @override
  String get common_darkMode => 'الوضع المظلم';

  @override
  String get common_lightMode => 'الوضع المضيء';

  @override
  String get common_themeToggle => 'تبديل المظهر';

  @override
  String get common_darkModeIcon => 'أيقونة الوضع المظلم';

  @override
  String get common_lightModeIcon => 'أيقونة الوضع المضيء';

  @override
  String get common_back => 'رجوع';

  @override
  String get common_showPassword => 'إظهار كلمة المرور';

  @override
  String get common_hidePassword => 'إخفاء كلمة المرور';

  @override
  String get ethicalPolicy_salary_transparency => 'شفافية الرواتب';

  @override
  String get ethicalPolicy_equal_pay_policy => 'سياسة المساواة في الأجور';

  @override
  String get ethicalPolicy_living_wage_employer => 'صاحب عمل بأجر معيشي';

  @override
  String get ethicalPolicy_comprehensive_health_insurance => 'تأمين صحي شامل';

  @override
  String get ethicalPolicy_performance_based_bonus => 'مكافأة على أساس الأداء';

  @override
  String get ethicalPolicy_retirement_plan_support => 'دعم خطة التقاعد';

  @override
  String get ethicalPolicy_flexible_hours => 'ساعات عمل مرنة';

  @override
  String get ethicalPolicy_remote_friendly => 'صديق للعمل عن بُعد';

  @override
  String get ethicalPolicy_no_after_hours_work_culture =>
      'ثقافة عدم العمل بعد ساعات العمل';

  @override
  String get ethicalPolicy_mental_health_support => 'دعم الصحة النفسية';

  @override
  String get ethicalPolicy_generous_paid_time_off => 'إجازة مدفوعة سخية';

  @override
  String get ethicalPolicy_paid_parental_leave => 'إجازة والدية مدفوعة';

  @override
  String get ethicalPolicy_inclusive_hiring_practices => 'ممارسات توظيف شاملة';

  @override
  String get ethicalPolicy_diverse_leadership => 'قيادة متنوعة';

  @override
  String get ethicalPolicy_lgbtq_friendly_workplace =>
      'مكان عمل صديق لمجتمع LGBTQ+';

  @override
  String get ethicalPolicy_disability_inclusive_workplace =>
      'مكان عمل شامل لذوي الإعاقة';

  @override
  String get ethicalPolicy_supports_women_in_leadership =>
      'يدعم النساء في القيادة';

  @override
  String get ethicalPolicy_mentorship_program => 'برنامج إرشاد';

  @override
  String get ethicalPolicy_learning_development_budget =>
      'ميزانية التعلم والتطوير';

  @override
  String get ethicalPolicy_transparent_promotion_paths => 'مسارات ترقية شفافة';

  @override
  String get ethicalPolicy_internal_mobility => 'التنقل الداخلي';

  @override
  String get ethicalPolicy_sustainability_focused => 'التركيز على الاستدامة';

  @override
  String get ethicalPolicy_ethical_supply_chain => 'سلسلة توريد أخلاقية';

  @override
  String get ethicalPolicy_community_volunteering => 'التطوع المجتمعي';

  @override
  String get ethicalPolicy_certified_b_corporation => 'شركة B معتمدة';
}
