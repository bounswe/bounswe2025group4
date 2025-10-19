// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Turkish (`tr`).
class AppLocalizationsTr extends AppLocalizations {
  AppLocalizationsTr([String locale = 'tr']) : super(locale);

  @override
  String get welcomeScreen_stayMotivated => 'Motive kalın!';

  @override
  String get welcomeScreen_title => 'Etik İş Platformuna Hoş Geldiniz';

  @override
  String get welcomeScreen_subtitle =>
      'Değerlerinizi paylaşan şirketlerle bağlantı kurun ve etik bir kariyer yolu oluşturun';

  @override
  String get welcomeScreen_getStarted => 'Başlayın';

  @override
  String get welcomeScreen_alreadyHaveAccount => 'Zaten bir hesabım var';

  @override
  String get signInScreen_title => 'Giriş Yap';

  @override
  String get signInScreen_welcomeBack => 'Tekrar hoş geldiniz!';

  @override
  String get signInScreen_username => 'Kullanıcı Adı';

  @override
  String get signInScreen_password => 'Şifre';

  @override
  String get signInScreen_usernameRequired => 'Lütfen kullanıcı adınızı girin';

  @override
  String get signInScreen_passwordRequired => 'Lütfen şifrenizi girin';

  @override
  String get signInScreen_signInButton => 'Giriş Yap';

  @override
  String get signInScreen_dontHaveAccount => 'Hesabınız yok mu?';

  @override
  String get signInScreen_signUpLink => 'Kayıt Ol';

  @override
  String get signInScreen_loginFailed =>
      'Giriş Başarısız. Lütfen kimlik bilgilerinizi kontrol edin.';

  @override
  String get signUpScreen_title => 'Kayıt Ol';

  @override
  String get signUpScreen_createAccount => 'Hesabınızı oluşturun';

  @override
  String get signUpScreen_username => 'Kullanıcı Adı';

  @override
  String get signUpScreen_email => 'E-posta';

  @override
  String get signUpScreen_password => 'Şifre';

  @override
  String get signUpScreen_confirmPassword => 'Şifreyi Onayla';

  @override
  String get signUpScreen_bio => 'Biyografi';

  @override
  String get signUpScreen_usernameRequired => 'Lütfen bir kullanıcı adı girin';

  @override
  String get signUpScreen_emailRequired => 'Lütfen e-posta adresinizi girin';

  @override
  String get signUpScreen_emailInvalid =>
      'Lütfen geçerli bir e-posta adresi girin';

  @override
  String get signUpScreen_passwordRequired => 'Lütfen bir şifre girin';

  @override
  String get signUpScreen_passwordTooShort =>
      'Şifre en az 6 karakter olmalıdır';

  @override
  String get signUpScreen_confirmPasswordRequired =>
      'Lütfen şifrenizi onaylayın';

  @override
  String get signUpScreen_passwordsDoNotMatch => 'Şifreler eşleşmiyor';

  @override
  String get signUpScreen_bioRequired => 'Lütfen bir biyografi girin';

  @override
  String get signUpScreen_signUpButton => 'Kayıt Ol';

  @override
  String get signUpScreen_alreadyHaveAccount => 'Zaten hesabınız var mı?';

  @override
  String get signUpScreen_signInLink => 'Giriş Yap';

  @override
  String get signUpScreen_userTypeMissing =>
      'Kullanıcı türü eksik. Lütfen kayıt işlemini yeniden başlatın.';

  @override
  String get signUpScreen_signUpFailed =>
      'Kayıt başarısız oldu. Lütfen daha sonra tekrar deneyin.';

  @override
  String get signUpScreen_mentorProfileFailed =>
      'Mentor profili oluşturulamadı. Lütfen tekrar deneyin veya destek ile iletişime geçin.';

  @override
  String get signUpScreen_alreadyExists =>
      'Kullanıcı adı veya e-posta zaten mevcut.';

  @override
  String signUpScreen_registrationFailed(String error) {
    return 'Kayıt başarısız oldu: $error';
  }

  @override
  String get userTypeScreen_question => 'Platformumuzu nasıl kullanacaksınız?';

  @override
  String get userTypeScreen_jobSeeker => 'İş Arayan';

  @override
  String get userTypeScreen_jobSeekerDesc =>
      'Değerlerinizle uyumlu etik şirketler ve fırsatlar bulun';

  @override
  String get userTypeScreen_employer => 'İşveren';

  @override
  String get userTypeScreen_employerDesc =>
      'İş ilanları yayınlayın ve şirketinizin değerlerini paylaşan adaylar bulun';

  @override
  String get userTypeScreen_continue => 'Devam Et';

  @override
  String get mainScaffold_forum => 'Forum';

  @override
  String get mainScaffold_jobs => 'İşler';

  @override
  String get mainScaffold_mentorship => 'Mentorluk';

  @override
  String get mainScaffold_profile => 'Profil';

  @override
  String get mainScaffold_workplaces => 'İş Yerleri';

  @override
  String get common_loading => 'Yükleniyor...';

  @override
  String get common_error => 'Hata';

  @override
  String get common_retry => 'Tekrar Dene';

  @override
  String get common_cancel => 'İptal';

  @override
  String get common_save => 'Kaydet';

  @override
  String get common_delete => 'Sil';

  @override
  String get common_edit => 'Düzenle';

  @override
  String get common_search => 'Ara';

  @override
  String get common_ok => 'Tamam';

  @override
  String get common_yes => 'Evet';

  @override
  String get common_no => 'Hayır';

  @override
  String get profilePage_title => 'Profilim';

  @override
  String get profilePage_editProfile => 'Profili düzenle';

  @override
  String get profilePage_logout => 'Çıkış Yap';

  @override
  String get profilePage_failedToLoad => 'Profil yüklenemedi';

  @override
  String profilePage_fontSizeChanged(String size) {
    return 'Yazı boyutu $size olarak değiştirildi';
  }

  @override
  String profilePage_languageChanged(String language) {
    return 'Dil $language olarak değiştirildi';
  }

  @override
  String get careerStatusScreen_question => 'Mevcut kariyer durumunuz nedir?';

  @override
  String get careerStatusScreen_student => 'Öğrenci';

  @override
  String get careerStatusScreen_recentGraduate => 'Yeni Mezun';

  @override
  String get careerStatusScreen_midLevel => 'Orta Düzey Profesyonel';

  @override
  String get careerStatusScreen_senior => 'Kıdemli Profesyonel';

  @override
  String get careerStatusScreen_changingCareers =>
      'Kariyer Değişikliği Yapıyor';

  @override
  String get organizationTypeScreen_question =>
      'Ne tür bir organizasyonu temsil ediyorsunuz?';

  @override
  String get organizationTypeScreen_company => 'Şirket';

  @override
  String get organizationTypeScreen_startup => 'Girişim';

  @override
  String get organizationTypeScreen_nonprofit => 'Kar Amacı Gütmeyen';

  @override
  String get organizationTypeScreen_freelancer =>
      'Proje için serbest çalışan arayan';

  @override
  String get organizationTypeScreen_other => 'Diğer';

  @override
  String get organizationTypeScreen_pleaseSpecify => 'Lütfen belirtin';

  @override
  String get jobPrioritiesScreen_question =>
      'İş ararken en önemli öncelikleriniz nelerdir?';

  @override
  String get jobPrioritiesScreen_selectAll => 'Uygun olanların hepsini seçin';

  @override
  String get jobPrioritiesScreen_fairWages => 'Adil Ücretler';

  @override
  String get jobPrioritiesScreen_fairWagesDesc =>
      'Yaşam ücreti ödeyen ve şeffaf ücret uygulamaları olan şirketler';

  @override
  String get jobPrioritiesScreen_inclusive => 'Kapsayıcı İşyeri';

  @override
  String get jobPrioritiesScreen_inclusiveDesc =>
      'Çeşitlilik, eşitlik ve kapsayıcılığa bağlı organizasyonlar';

  @override
  String get jobPrioritiesScreen_sustainability =>
      'Sürdürülebilirlik/Çevre Politikaları';

  @override
  String get jobPrioritiesScreen_sustainabilityDesc =>
      'Güçlü çevre taahhütleri ve uygulamaları olan şirketler';

  @override
  String get jobPrioritiesScreen_workLife => 'İş-Yaşam Dengesi';

  @override
  String get jobPrioritiesScreen_workLifeDesc =>
      'Esnek çalışma seçenekleriyle kişisel zamana saygılı';

  @override
  String get jobPrioritiesScreen_remote => 'Uzaktan Çalışma Dostu';

  @override
  String get jobPrioritiesScreen_remoteDesc =>
      'Uzaktan çalışma ve esnek konum seçenekleri';

  @override
  String get jobPrioritiesScreen_growth => 'Kariyer Gelişim Fırsatları';

  @override
  String get jobPrioritiesScreen_growthDesc =>
      'İlerleme ve profesyonel gelişim için net yollar';

  @override
  String get companyPoliciesScreen_question =>
      'Şirketiniz hangi etik politikaları takip ediyor?';

  @override
  String get companyPoliciesScreen_fairWage => 'Adil ücret taahhüdü';

  @override
  String get companyPoliciesScreen_fairWageDesc =>
      'Rekabetçi ücretlendirme ve şeffaf ödeme uygulamaları';

  @override
  String get companyPoliciesScreen_diversity =>
      'Çeşitlilik ve kapsayıcılık politikası';

  @override
  String get companyPoliciesScreen_diversityDesc =>
      'Eşit fırsatlarla kapsayıcı bir işyeri teşvik etme';

  @override
  String get companyPoliciesScreen_wellbeing => 'Çalışan refahı programları';

  @override
  String get companyPoliciesScreen_wellbeingDesc =>
      'Ruh sağlığı, iş-yaşam dengesi ve kişisel gelişimi destekleme';

  @override
  String get companyPoliciesScreen_remotePolicy =>
      'Uzaktan çalışma dostu kültür';

  @override
  String get companyPoliciesScreen_remotePolicyDesc =>
      'Esnek çalışma düzenlemeleri ve uzaktan seçenekler sunma';

  @override
  String get companyPoliciesScreen_sustainabilityPolicy =>
      'Sürdürülebilirlik/çevre hedefleri';

  @override
  String get companyPoliciesScreen_sustainabilityPolicyDesc =>
      'Çevre dostu uygulamalar ve çevresel etkileri azaltma';

  @override
  String get industrySelectionScreen_question =>
      'Hangi sektörlerle en çok ilgileniyorsunuz?';

  @override
  String get industrySelectionScreen_tech => 'Teknoloji';

  @override
  String get industrySelectionScreen_healthcare => 'Sağlık';

  @override
  String get industrySelectionScreen_education => 'Eğitim';

  @override
  String get industrySelectionScreen_finance => 'Finans';

  @override
  String get industrySelectionScreen_creativeArts => 'Yaratıcı Sanatlar';

  @override
  String get mentorshipSelectionScreen_question =>
      'Mentorluk sistemimize katılmak ister misiniz?';

  @override
  String get mentorshipSelectionScreen_subtitle =>
      'Kariyer rehberliği almak veya sağlamak için başkalarıyla bağlantı kurabilirsiniz.';

  @override
  String get mentorshipSelectionScreen_beMentor => 'Mentor olmak istiyorum';

  @override
  String get mentorshipSelectionScreen_beMentorDesc =>
      'Başkalarının özgeçmişlerini ve kariyerlerini geliştirmelerine yardımcı olun';

  @override
  String get mentorshipSelectionScreen_lookingForMentor =>
      'Mentor arıyorum (mentee)';

  @override
  String get mentorshipSelectionScreen_lookingForMentorDesc =>
      'Profesyonel olarak büyümek için geri bildirim ve rehberlik alın';

  @override
  String get mentorshipSelectionScreen_maxMentees =>
      'Kaç mentee almaya hazırsınız?';

  @override
  String get mentorshipSelectionScreen_maxMenteesLabel =>
      'Maksimum Mentee Sayısı (1-20)';

  @override
  String get mentorshipSelectionScreen_enterNumber => 'Lütfen bir sayı girin';

  @override
  String get mentorshipSelectionScreen_validNumber =>
      'Lütfen geçerli bir sayı girin';

  @override
  String get mentorshipSelectionScreen_greaterThanZero =>
      '0\'dan büyük olmalıdır';

  @override
  String get mentorshipSelectionScreen_lessThan21 => '21\'den küçük olmalıdır';

  @override
  String get jobPage_title => 'İşler';

  @override
  String get jobPage_search => 'İş ara...';

  @override
  String get jobPage_filter => 'Filtrele';

  @override
  String get jobPage_createJob => 'İş İlanı Oluştur';

  @override
  String get jobPage_myApplications => 'Başvurularım';

  @override
  String get jobPage_viewApplications => 'Başvuruları Görüntüle';

  @override
  String get jobPage_noJobs => 'İş ilanı bulunamadı';

  @override
  String get jobPage_loadError => 'İşler yüklenemedi. Lütfen tekrar deneyin.';

  @override
  String get jobPage_posted => 'Yayınlandı';

  @override
  String get jobPage_remote => 'Uzaktan';

  @override
  String get jobPage_yourPostedJobs => 'Yayınladığınız İşler';

  @override
  String get jobPage_noPostedJobs => 'Henüz iş ilanı yayınlamadınız.';

  @override
  String get jobDetails_title => 'İş Detayları';

  @override
  String get jobDetails_apply => 'Şimdi Başvur';

  @override
  String get jobDetails_loadError =>
      'İş detayları yüklenemedi. Lütfen tekrar deneyin.';

  @override
  String get jobDetails_applyError => 'Hata: Kullanıcı tanımlanamadı.';

  @override
  String jobDetails_applySuccess(String jobTitle) {
    return '$jobTitle pozisyonuna başarıyla başvuruldu';
  }

  @override
  String get jobDetails_company => 'Şirket';

  @override
  String get jobDetails_location => 'Konum';

  @override
  String get jobDetails_salary => 'Maaş';

  @override
  String get jobDetails_description => 'Açıklama';

  @override
  String get jobDetails_requirements => 'Gereksinimler';

  @override
  String get jobDetails_ethicalTags => 'Etik Etiketler';

  @override
  String get jobDetails_notFound => 'İş detayları bulunamadı.';

  @override
  String get jobDetails_noTags => 'Belirli etiket yok.';

  @override
  String get jobDetails_salaryRange => 'Maaş Aralığı';

  @override
  String get jobDetails_contactInfo => 'İletişim Bilgileri';

  @override
  String get jobDetails_applying => 'Başvuruluyor...';

  @override
  String get forumPage_title => 'Forum';

  @override
  String get forumPage_loadError =>
      'Forum yüklenemedi: Lütfen bağlantınızı kontrol edip tekrar deneyin.';

  @override
  String get forumPage_noDiscussions => 'Henüz tartışma yok';

  @override
  String get forumPage_filter => 'Filtrele';

  @override
  String get forumPage_searchTags => 'Etiket ara';

  @override
  String get forumPage_reset => 'Sıfırla';

  @override
  String get createThread_newTitle => 'Yeni Tartışma';

  @override
  String get createThread_editTitle => 'Tartışmayı Düzenle';

  @override
  String get createThread_titleLabel => 'Başlık';

  @override
  String get createThread_titleRequired => 'Lütfen bir başlık girin';

  @override
  String get createThread_titleMaxLength =>
      'Başlık en fazla 100 karakter olmalıdır';

  @override
  String get createThread_bodyLabel => 'Aklınızdan ne geçiyor?';

  @override
  String get createThread_bodyRequired => 'Lütfen içerik girin';

  @override
  String get createThread_tags => 'Etiketler';

  @override
  String get createThread_selectTags => 'Etiket Seç';

  @override
  String get createThread_suggestTags => 'Etiket Öner';

  @override
  String get createThread_enterTitleForSuggestions =>
      'Etiket önerileri almak için lütfen bir başlık girin.';

  @override
  String get createThread_addNewTag => 'Yeni etiket ekle';

  @override
  String get createThread_tagEmpty => 'Etiket adı boş olamaz.';

  @override
  String get createThread_tagMaxLength =>
      'Etiket adı en fazla 255 karakter olmalıdır.';

  @override
  String get createThread_done => 'Tamam';

  @override
  String get createThread_post => 'Gönder';

  @override
  String get createThread_save => 'Kaydet';

  @override
  String get createThread_createError =>
      'Tartışma oluşturma/düzenleme başarısız. Lütfen bağlantınızı kontrol edin.';

  @override
  String get createThread_generalError =>
      'Tartışma oluşturma/düzenleme başarısız.';

  @override
  String get threadDetail_report => 'Bildir';

  @override
  String get threadDetail_edit => 'Düzenle';

  @override
  String get threadDetail_delete => 'Sil';

  @override
  String get threadDetail_reported => 'Tartışma bildirildi';

  @override
  String get threadDetail_connectionError =>
      'Başarısız: Lütfen bağlantınızı kontrol edip sayfayı yenileyin.';

  @override
  String get threadDetail_unavailable =>
      'Başarısız: Bu tartışma artık mevcut değil.';

  @override
  String get threadDetail_deleteError => 'Tartışma silinemedi.';

  @override
  String get threadDetail_threadDetails => 'Tartışma Detayları';

  @override
  String get threadDetail_creator => 'Oluşturan: ';

  @override
  String get threadDetail_content => 'İçerik:';

  @override
  String get threadDetail_tags => 'Etiketler:';

  @override
  String threadDetail_created(String date) {
    return 'Oluşturulma: $date';
  }

  @override
  String threadDetail_edited(String date) {
    return 'Düzenleme: $date';
  }

  @override
  String get threadDetail_comments => 'Yorumlar';

  @override
  String get threadDetail_addComment => 'Yorum ekle…';

  @override
  String get threadDetail_commentRequired => 'Lütfen bir yorum girin';

  @override
  String get threadDetail_deleteCommentError => 'Yorum silinemedi.';

  @override
  String get mentorshipPage_title => 'Mentorluk';

  @override
  String get mentorshipPage_loginRequired =>
      'Mentorluk özelliklerine erişmek için lütfen giriş yapın.';

  @override
  String get mentorScreen_title => 'Mentorluk';

  @override
  String get mentorScreen_currentMentees => 'Mevcut Mentiler';

  @override
  String get mentorScreen_requests => 'Talepler';

  @override
  String mentorScreen_currentCapacity(int capacity) {
    return 'Mevcut Kapasite: $capacity';
  }

  @override
  String get mentorScreen_updateCapacity => 'Kapasiteyi Güncelle';

  @override
  String get mentorScreen_noCurrentMentees => 'Mevcut menti yok';

  @override
  String get mentorScreen_noPendingRequests => 'Bekleyen talep yok';

  @override
  String get mentorScreen_capacityUpdated => 'Kapasite başarıyla güncellendi';

  @override
  String get mentorScreen_requestAccepted => 'Talep kabul edildi';

  @override
  String get mentorScreen_requestRejected => 'Talep reddedildi';

  @override
  String get mentorScreen_mentorshipCompleted =>
      'Mentorluk başarıyla tamamlandı';

  @override
  String get mentorScreen_mentorshipCancelled =>
      'Mentorluk başarıyla iptal edildi';

  @override
  String mentorScreen_openChat(String menteeName) {
    return '$menteeName ile sohbet aç';
  }

  @override
  String get mentorScreen_updateCapacityTitle =>
      'Maksimum Menti Kapasitesini Güncelle';

  @override
  String get mentorScreen_maxMentees => 'Maksimum menti sayısı';

  @override
  String get mentorScreen_enterNumber => 'Bir sayı girin';

  @override
  String get mentorScreen_cancel => 'İptal';

  @override
  String get mentorScreen_update => 'Güncelle';

  @override
  String get mentorScreen_completeMentorship => 'Mentorluğu tamamla';

  @override
  String get mentorScreen_cancelMentorship => 'Mentorluğu iptal et';

  @override
  String mentorScreen_confirmComplete(String menteeName) {
    return '$menteeName ile mentorluğunuzu tamamlamak istediğinizden emin misiniz?\n\nBu, mentorluğu başarıyla tamamlanmış olarak işaretleyecektir.';
  }

  @override
  String mentorScreen_confirmCancel(String menteeName) {
    return '$menteeName ile mentorluğunuzu iptal etmek istediğinizden emin misiniz?\n\nBu, mentorluk ilişkisini sona erdirecektir.';
  }

  @override
  String get mentorScreen_confirm => 'Onayla';

  @override
  String get menteeScreen_findMentors => 'Mentor Bul';

  @override
  String get menteeScreen_myMentorships => 'Mentorluklarım';

  @override
  String get menteeScreen_searchMentors =>
      'Mentorları isim, rol, şirket ile ara...';

  @override
  String get menteeScreen_noMentorsFound => 'Mentor bulunamadı.';

  @override
  String menteeScreen_errorLoadingMentors(String error) {
    return 'Mentorlar yüklenirken hata: $error';
  }

  @override
  String get menteeScreen_retryLoadingMentors => 'Mentorları Tekrar Yükle';

  @override
  String menteeScreen_requestMentorshipTitle(String mentorName) {
    return '$mentorName ile Mentorluk Talep Et';
  }

  @override
  String get menteeScreen_provideMessage =>
      'Lütfen mentorluk talebiniz için bir mesaj sağlayın:';

  @override
  String get menteeScreen_messageHint =>
      'Benim mentorum olmanı istiyorum çünkü...';

  @override
  String get menteeScreen_sendRequest => 'Talebi Gönder';

  @override
  String get menteeScreen_messageMinLength =>
      'Lütfen en az 10 karakter uzunluğunda bir mesaj girin';

  @override
  String menteeScreen_requestSent(String mentorName) {
    return '$mentorName için mentorluk talep edildi';
  }

  @override
  String get menteeScreen_requestError => 'Talep ederken bir hata oluştu';

  @override
  String get menteeScreen_pendingRequests => 'Bekleyen Talepler';

  @override
  String get menteeScreen_activeMentorships => 'Aktif Mentorluklar';

  @override
  String get menteeScreen_noPendingRequests => 'Bekleyen talep yok.';

  @override
  String get menteeScreen_noActiveMentorships => 'Aktif mentorluk yok.';

  @override
  String menteeScreen_error(String error) {
    return 'Hata: $error';
  }

  @override
  String mentorProfile_title(String mentorName) {
    return 'Mentor Profili: $mentorName';
  }

  @override
  String mentorProfile_loadError(String error) {
    return 'Mentor profili veya yorumları yüklenemedi: $error';
  }

  @override
  String get mentorProfile_noProfileData => 'Profil verisi mevcut değil';

  @override
  String get mentorProfile_rateMentor => 'Bu mentoru değerlendir';

  @override
  String mentorProfile_atCompany(String company) {
    return '$company şirketinde';
  }

  @override
  String get mentorProfile_rating => 'Değerlendirme';

  @override
  String mentorProfile_reviews(int count) {
    return '$count yorum';
  }

  @override
  String get mentorProfile_mentorshipInfo => 'Mentorluk Bilgileri';

  @override
  String get mentorProfile_capacity => 'Kapasite';

  @override
  String mentorProfile_mentees(int current, int max) {
    return '$current/$max menti';
  }

  @override
  String get mentorProfile_status => 'Durum';

  @override
  String get mentorProfile_available => 'Mentorluk için müsait';

  @override
  String get mentorProfile_notAvailable => 'Mentorluk için müsait değil';

  @override
  String get mentorProfile_about => 'Hakkında';

  @override
  String get mentorProfile_noReviews => 'Henüz yorum yok.';

  @override
  String mentorProfile_byUser(String username) {
    return 'Yazan: $username';
  }

  @override
  String mentorProfile_rateTitle(String mentorName) {
    return '$mentorName Değerlendir';
  }

  @override
  String get mentorProfile_selectRating => 'Bir değerlendirme seçin:';

  @override
  String get mentorProfile_commentOptional => 'Yorum (isteğe bağlı)';

  @override
  String get mentorProfile_submitting => 'Gönderiliyor...';

  @override
  String get mentorProfile_submit => 'Gönder';

  @override
  String get mentorProfile_selectRatingError =>
      'Lütfen bir değerlendirme seçin';

  @override
  String get mentorProfile_ratingSubmitted =>
      'Değerlendirme başarıyla gönderildi';

  @override
  String mentorProfile_ratingError(String error) {
    return 'Değerlendirme gönderilirken hata: $error';
  }

  @override
  String directMessage_title(String mentorName) {
    return '$mentorName';
  }

  @override
  String get directMessage_attachFile => 'Dosya ekle';

  @override
  String get directMessage_typeMessage => 'Mesaj yazın...';

  @override
  String get directMessage_sendMessage => 'Mesaj gönder';

  @override
  String get directMessage_fileNotImplemented =>
      'Dosya ekleme henüz uygulanmadı.';

  @override
  String get createJob_title => 'Yeni İş İlanı Oluştur';

  @override
  String get createJob_jobDetails => 'İş Detayları';

  @override
  String get createJob_jobTitle => 'İş Başlığı';

  @override
  String get createJob_jobTitleRequired => 'Lütfen bir iş başlığı girin';

  @override
  String get createJob_company => 'Şirket';

  @override
  String get createJob_companyHint => 'Şirket Adınız';

  @override
  String get createJob_companyRequired => 'Lütfen şirket adını girin';

  @override
  String get createJob_location => 'Konum (örn. Şehir, Eyalet, Ülke)';

  @override
  String get createJob_locationRequired => 'Lütfen bir konum girin';

  @override
  String get createJob_remoteJob => 'Uzaktan İş';

  @override
  String get createJob_description => 'İş Açıklaması';

  @override
  String get createJob_descriptionRequired => 'Lütfen bir iş açıklaması girin';

  @override
  String get createJob_jobType => 'İş Türü';

  @override
  String get createJob_selectJobType => 'İş Türü Seçin';

  @override
  String get createJob_jobTypeRequired => 'Lütfen bir iş türü seçin';

  @override
  String get createJob_contactInfo =>
      'İletişim Bilgileri (E-posta/Telefon/Bağlantı)';

  @override
  String get createJob_contactInfoRequired =>
      'Lütfen iletişim bilgilerini sağlayın';

  @override
  String get createJob_minSalary => 'Minimum Maaş (İsteğe Bağlı)';

  @override
  String get createJob_minSalaryHint => 'örn. 50000';

  @override
  String get createJob_maxSalary => 'Maksimum Maaş (İsteğe Bağlı)';

  @override
  String get createJob_maxSalaryHint => 'örn. 70000';

  @override
  String get createJob_validNumber => 'Lütfen geçerli bir sayı girin';

  @override
  String get createJob_invalidFormat =>
      'Geçersiz sayı formatı (çok fazla ondalık nokta)';

  @override
  String get createJob_maxSalaryError =>
      'Maksimum maaş >= minimum maaş olmalıdır';

  @override
  String get createJob_ethicalPolicies => 'Etik Politikalar Uyumu';

  @override
  String get createJob_creatingPost => 'İlan Oluşturuluyor...';

  @override
  String get createJob_createPost => 'İş İlanı Oluştur';

  @override
  String get createJob_selectJobTypeError => 'Lütfen bir iş türü seçin.';

  @override
  String get createJob_selectPolicyError =>
      'Lütfen en az bir etik politika seçin.';

  @override
  String get createJob_employerError => 'Hata: İşveren hesabı doğrulanamadı.';

  @override
  String get createJob_invalidMinSalary =>
      'Geçersiz minimum maaş formatı. Lütfen sadece sayı girin.';

  @override
  String get createJob_invalidMaxSalary =>
      'Geçersiz maksimum maaş formatı. Lütfen sadece sayı girin.';

  @override
  String get createJob_salaryRangeError =>
      'Minimum maaş maksimum maaştan büyük olamaz.';

  @override
  String createJob_success(String jobTitle) {
    return 'İş \"$jobTitle\" başarıyla oluşturuldu!';
  }

  @override
  String createJob_error(String error) {
    return 'İş oluşturulurken hata: $error';
  }

  @override
  String get jobApplications_title => 'İş Başvuruları';

  @override
  String get jobApplications_userError =>
      'Kullanıcı giriş yapmamış veya kullanıcı kimliği bulunamadı.';

  @override
  String get jobApplications_loadError =>
      'Başvurular yüklenemedi. Lütfen tekrar deneyin.';

  @override
  String get jobApplications_noApplications =>
      'Bu iş için henüz başvuru alınmadı.';

  @override
  String jobApplications_applied(String date) {
    return 'Başvuru: $date';
  }

  @override
  String jobApplications_feedback(String feedback) {
    return 'Geri Bildirim: $feedback';
  }

  @override
  String get jobApplications_reject => 'Reddet';

  @override
  String get jobApplications_approve => 'Onayla';

  @override
  String jobApplications_statusUpdated(String status) {
    return 'Başvuru $status.';
  }

  @override
  String jobApplications_updateError(String error) {
    return 'Durum güncellenirken hata: $error';
  }

  @override
  String jobApplications_feedbackTitle(String action) {
    return '$action için Geri Bildirim Sağla (İsteğe Bağlı)';
  }

  @override
  String get jobApplications_feedbackHint => 'Geri bildirimi buraya girin...';

  @override
  String get jobApplications_submit => 'Gönder';

  @override
  String get jobFilter_title => 'İşleri Filtrele';

  @override
  String get jobFilter_jobTitle => 'İş Başlığı';

  @override
  String get jobFilter_jobTitleHint => 'İş başlığı öneki girin';

  @override
  String get jobFilter_companyName => 'Şirket Adı';

  @override
  String get jobFilter_companyNameHint => 'Şirket adı öneki girin';

  @override
  String get jobFilter_ethicalPolicies => 'Etik Politikalar';

  @override
  String get jobFilter_minSalary => 'Min Maaş';

  @override
  String get jobFilter_minSalaryHint => 'örn. 30000';

  @override
  String get jobFilter_maxSalary => 'Max Maaş';

  @override
  String get jobFilter_maxSalaryHint => 'örn. 100000';

  @override
  String get jobFilter_remoteOnly => 'Sadece Uzaktan İşler';

  @override
  String get jobFilter_jobType => 'İş Türü';

  @override
  String get jobFilter_clearAll => 'Tümünü Temizle';

  @override
  String get jobFilter_applyFilters => 'Filtreleri Uygula';

  @override
  String get myApplications_title => 'İş Başvurularım';

  @override
  String get myApplications_userError =>
      'Hata: Kullanıcı bulunamadı. Başvurular yüklenemiyor.';

  @override
  String get myApplications_loadError =>
      'Başvurular yüklenemedi. Lütfen tekrar deneyin.';

  @override
  String get myApplications_noApplications => 'Henüz hiçbir işe başvurmadınız.';

  @override
  String myApplications_applied(String date) {
    return 'Başvuru: $date';
  }

  @override
  String myApplications_feedback(String feedback) {
    return 'Geri Bildirim: $feedback';
  }

  @override
  String myApplications_feedbackTitle(String jobTitle) {
    return '$jobTitle için Geri Bildirim';
  }

  @override
  String get myApplications_close => 'Kapat';

  @override
  String get workplaces_title => 'İş Yerleri';

  @override
  String workplaces_reviews(int count) {
    return '$count yorum';
  }

  @override
  String get editProfile_title => 'Düzenle';

  @override
  String get editProfile_saveChanges => 'Değişiklikleri kaydet';

  @override
  String get editProfile_personalInfo => 'Kişisel Bilgiler';

  @override
  String get editProfile_fullName => 'Ad Soyad';

  @override
  String get editProfile_bio => 'Biyografi';

  @override
  String get editProfile_location => 'Konum';

  @override
  String get editProfile_phone => 'Telefon';

  @override
  String get editProfile_occupation => 'Meslek';

  @override
  String get editProfile_accountInfo => 'Hesap Bilgileri';

  @override
  String get editProfile_username => 'Kullanıcı Adı';

  @override
  String get editProfile_email => 'E-posta';

  @override
  String get editProfile_workExperience => 'İş Deneyimi';

  @override
  String get editProfile_education => 'Eğitim';

  @override
  String get editProfile_addWorkExperience => 'İş Deneyimi Ekle';

  @override
  String get editProfile_addEducation => 'Eğitim Ekle';

  @override
  String get userProfile_title => 'Kullanıcı Profili';

  @override
  String get userProfile_loadError => 'Kullanıcı profili yüklenemedi';

  @override
  String get userProfile_tryAgain => 'Tekrar Dene';

  @override
  String get userProfile_workExperience => 'İş Deneyimi';

  @override
  String get userProfile_education => 'Eğitim';

  @override
  String get userProfile_noWorkExperience => 'Henüz iş deneyimi eklenmemiş';

  @override
  String get userProfile_noEducation => 'Henüz eğitim eklenmemiş';

  @override
  String get userProfile_skills => 'Yetenekler';

  @override
  String get userProfile_interests => 'İlgi Alanları';

  @override
  String profilePage_username(String username) {
    return 'Kullanıcı Adı: $username';
  }

  @override
  String profilePage_email(String email) {
    return 'E-posta: $email';
  }

  @override
  String get profilePage_skills => 'Yetenekler';

  @override
  String get profilePage_noSkills => 'Henüz yetenek eklenmemiş.';

  @override
  String get profilePage_addSkill => 'Yetenek Ekle';

  @override
  String get profilePage_enterSkill => 'Bir yetenek girin';

  @override
  String get profilePage_interests => 'İlgi Alanları';

  @override
  String get profilePage_noInterests => 'Henüz ilgi alanı eklenmemiş.';

  @override
  String get profilePage_addInterest => 'İlgi Alanı Ekle';

  @override
  String get profilePage_enterInterest => 'Bir ilgi alanı girin';

  @override
  String get profilePage_theme => 'Tema';

  @override
  String get profilePage_lightMode => 'Açık';

  @override
  String get profilePage_darkMode => 'Koyu';

  @override
  String get profilePage_systemMode => 'Sistem';

  @override
  String profilePage_themeChanged(String theme) {
    return 'Tema $theme olarak değiştirildi';
  }

  @override
  String get profilePage_fontSize => 'Yazı Boyutu';

  @override
  String get profilePage_small => 'Küçük';

  @override
  String get profilePage_medium => 'Orta';

  @override
  String get profilePage_large => 'Büyük';

  @override
  String get profilePage_language => 'Language / Dil / اللغة';

  @override
  String get profileWidgets_education => 'Eğitim';

  @override
  String get profileWidgets_add => 'Ekle';

  @override
  String get profileWidgets_noEducation => 'Henüz eğitim geçmişi eklenmemiş.';

  @override
  String get profileWidgets_deleteEducation => 'Eğitimi Sil';

  @override
  String profileWidgets_confirmDeleteEducation(String school) {
    return '$school okulundaki eğitiminizi silmek istediğinizden emin misiniz?';
  }

  @override
  String get profileWidgets_cancel => 'İptal';

  @override
  String get profileWidgets_delete => 'Sil';

  @override
  String get profileWidgets_workExperience => 'İş Deneyimi';

  @override
  String get profileWidgets_noWorkExperience => 'Henüz iş deneyimi eklenmemiş.';

  @override
  String get profileWidgets_deleteExperience => 'Deneyimi Sil';

  @override
  String profileWidgets_confirmDeleteExperience(String company) {
    return '$company şirketindeki deneyiminizi silmek istediğinizden emin misiniz?';
  }

  @override
  String get educationDialog_addTitle => 'Eğitim Ekle';

  @override
  String get educationDialog_editTitle => 'Eğitimi Düzenle';

  @override
  String get educationDialog_school => 'Okul/Üniversite';

  @override
  String get educationDialog_schoolRequired => 'Lütfen bir okul adı girin';

  @override
  String get educationDialog_degree => 'Derece';

  @override
  String get educationDialog_degreeRequired => 'Lütfen bir derece girin';

  @override
  String get educationDialog_field => 'Çalışma Alanı';

  @override
  String get educationDialog_fieldRequired => 'Lütfen bir çalışma alanı girin';

  @override
  String get educationDialog_startDate => 'Başlangıç Tarihi (AA/YYYY)';

  @override
  String get educationDialog_startDateRequired =>
      'Lütfen bir başlangıç tarihi girin';

  @override
  String get educationDialog_currentlyStudying => 'Şu anda burada okuyorum';

  @override
  String get educationDialog_endDate => 'Bitiş Tarihi (AA/YYYY)';

  @override
  String get educationDialog_endDateRequired => 'Lütfen bir bitiş tarihi girin';

  @override
  String get educationDialog_save => 'Kaydet';

  @override
  String get workExperienceDialog_addTitle => 'İş Deneyimi Ekle';

  @override
  String get workExperienceDialog_editTitle => 'İş Deneyimini Düzenle';

  @override
  String get workExperienceDialog_company => 'Şirket';

  @override
  String get workExperienceDialog_companyRequired =>
      'Lütfen bir şirket adı girin';

  @override
  String get workExperienceDialog_position => 'Pozisyon';

  @override
  String get workExperienceDialog_positionRequired =>
      'Lütfen bir pozisyon girin';

  @override
  String get workExperienceDialog_startDate => 'Başlangıç Tarihi (AA/YYYY)';

  @override
  String get workExperienceDialog_startDateRequired =>
      'Lütfen bir başlangıç tarihi girin';

  @override
  String get workExperienceDialog_currentlyWorking =>
      'Şu anda burada çalışıyorum';

  @override
  String get workExperienceDialog_endDate => 'Bitiş Tarihi (AA/YYYY)';

  @override
  String get workExperienceDialog_endDateRequired =>
      'Lütfen bir bitiş tarihi girin';

  @override
  String get workExperienceDialog_description => 'Açıklama';

  @override
  String get workExperienceDialog_descriptionRequired =>
      'Lütfen bir açıklama girin';

  @override
  String get workExperienceDialog_save => 'Kaydet';

  @override
  String get badges_title => 'Başarılar ve Rozetler';

  @override
  String get badges_noBadges => 'Henüz rozet kazanılmamış.';

  @override
  String badges_earned(String date) {
    return '$date tarihinde kazanıldı';
  }

  @override
  String get badges_today => 'bugün';

  @override
  String get badges_yesterday => 'dün';

  @override
  String badges_daysAgo(int days) {
    return '$days gün önce';
  }

  @override
  String badges_monthsAgo(int months, String monthText) {
    return '$months $monthText önce';
  }

  @override
  String badges_yearsAgo(int years, String yearText) {
    return '$years $yearText önce';
  }

  @override
  String get badges_month => 'ay';

  @override
  String get badges_months => 'ay';

  @override
  String get badges_year => 'yıl';

  @override
  String get badges_years => 'yıl';

  @override
  String get common_notSpecified => 'Belirtilmemiş';

  @override
  String common_upTo(String amount) {
    return '$amount kadar';
  }

  @override
  String common_from(String amount) {
    return '$amount\'den başlayarak';
  }

  @override
  String get common_darkMode => 'Karanlık Mod';

  @override
  String get common_lightMode => 'Aydınlık Mod';

  @override
  String get common_themeToggle => 'Tema Değiştir';

  @override
  String get common_darkModeIcon => 'Karanlık mod ikonu';

  @override
  String get common_lightModeIcon => 'Aydınlık mod ikonu';

  @override
  String get common_back => 'Geri';

  @override
  String get common_showPassword => 'Şifreyi göster';

  @override
  String get common_hidePassword => 'Şifreyi gizle';
}
