import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/components/ui/sheet';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth, useAuthActions } from '@shared/stores/authStore';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export default function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { logout } = useAuthActions();
  const { t, i18n } = useTranslation('common');
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(currentLanguage) === 'rtl';
  const isEmployer = user?.role === 'ROLE_EMPLOYER';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-12 md:h-16 items-center px-5">
          <div className="flex flex-1 items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">{t('layout.header.brand')}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {isEmployer ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/employer/dashboard">{t('layout.header.nav.employerDashboard')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/workplaces?tab=my">{t('layout.header.nav.workplaces')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/nonprofit-jobs">{t('layout.header.nav.nonProfitJobs')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/mentorship">{t('layout.header.nav.mentorship')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/forum">{t('layout.header.nav.forum')}</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/jobs">{t('layout.header.nav.jobs')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/nonprofit-jobs">{t('layout.header.nav.nonProfitJobs')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                  <Link to="/jobs?tab=workplaces">{t('layout.header.nav.workplaces')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/mentorship">{t('layout.header.nav.mentorship')}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/forum">{t('layout.header.nav.forum')}</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/profile">{t('layout.header.auth.profile')}</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  {t('layout.header.auth.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('layout.header.auth.login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">{t('layout.header.auth.signup')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t('layout.header.menu')}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? 'left' : 'right'} className="w-2/3">
              <SheetHeader>
                <SheetTitle>{t('layout.header.menu')}</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-2">
                {isEmployer ? (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/employer/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.employerDashboard')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                    <Link to="/workplaces?tab=my" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('layout.header.nav.workplaces')}
                    </Link>
                  </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/nonprofit-jobs" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.nonProfitJobs')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/mentorship" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.mentorship')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/forum" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.forum')}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.jobs')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/nonprofit-jobs" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.nonProfitJobs')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/jobs?tab=workplaces" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.workplaces')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/mentorship" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.mentorship')}
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/forum" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.nav.forum')}
                      </Link>
                    </Button>
                  </>
                )}
              </nav>

              <div className="flex flex-col gap-2 p-2 border-t mt-4">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>{t('layout.header.auth.profile')}</Link>
                    </Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                  >
                      {t('layout.header.auth.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.auth.login')}
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('layout.header.auth.signup')}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="border-t mt-4 pt-4">
                <LanguageSwitcher showLabel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}

