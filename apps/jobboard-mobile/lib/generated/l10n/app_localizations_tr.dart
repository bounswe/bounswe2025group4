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
}
