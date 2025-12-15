import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu as MenuIcon, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/components/ui/sheet';
import { Separator } from '@shared/components/ui/separator';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useAuth, useAuthActions } from '@shared/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { useMentorProfileQuery } from '@modules/mentorship/services/mentorship.service';
import NotificationBell from '@modules/notifications/components/NotificationBell';

type Role = 'ROLE_EMPLOYER' | 'ROLE_JOBSEEKER';

type NavItem = {
  label: string;
  to: string;
  requiresAuth?: boolean;
  allowedRoles?: Role[];
};

type NavSection = {
  key: string;
  label: string;
  items: NavItem[];
  requiresAuth?: boolean;
};

export default function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const { logout } = useAuthActions();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  
  // Check if user has a mentor profile
  const mentorProfileQuery = useMentorProfileQuery(
    user?.id,
    Boolean(user?.id && isAuthenticated)
  );
  const hasMentorProfile = Boolean(mentorProfileQuery.data);

  const navSections: NavSection[] = useMemo(
    () => [
      {
        key: 'jobs',
        label: t('layout.header.nav.jobs', 'Jobs'),
        items: [
          { label: t('jobs.tabs.browse', 'Browse Jobs'), to: '/jobs/browse' },
          {
            label: t('jobs.tabs.myApplications', 'My Applications'),
            to: '/jobs/applications',
            requiresAuth: true,
            allowedRoles: ['ROLE_JOBSEEKER'],
          },
          {
            label: t('jobs.tabs.employer', 'Employer Dashboard'),
            to: '/employer/dashboard',
            requiresAuth: true,
            allowedRoles: ['ROLE_EMPLOYER'],
          },
        ],
      },
      {
        key: 'volunteering',
        label: t('layout.header.nav.volunteering', 'Volunteering'),
        items: [
          {
            label: t('layout.header.nav.volunteerBrowse', 'Volunteer Opportunities'),
            to: '/nonprofit-jobs',
          },
        ],
      },
      {
        key: 'workplaces',
        label: t('layout.header.nav.workplaces', 'Workplaces'),
        items: [
          { label: t('workplaces.tabs.browse', 'Browse Workplaces'), to: '/workplaces/browse' },
          {
            label: t('workplaces.tabs.my', 'My Workplace Dashboard'),
            to: '/workplaces/my',
            requiresAuth: true,
            allowedRoles: ['ROLE_EMPLOYER'],
          },
        ],
      },
      {
        key: 'mentorship',
        label: t('layout.header.nav.mentorship', 'Mentorship'),
        items: [
          { label: t('mentorship.tabs.browse', 'Browse Mentors'), to: '/mentorship/browse' },
          { label: t('mentorship.tabs.my', 'My Mentorships'), to: '/mentorship/my', requiresAuth: true },
          ...(user?.id && hasMentorProfile ? [
            {
              label: t('mentorship.tabs.dashboard', 'Mentor Dashboard'), 
              to: '/mentorship/dashboard', 
              requiresAuth: true 
            },
            {
              label: t('mentorship.tabs.myProfile', 'My Profile'), 
              to: `/mentorship/${user.id}`, 
              requiresAuth: true 
            }
          ] : []),
        ],
      },
      {
        key: 'forum',
        label: t('layout.header.nav.forum', 'Forum'),
        items: [
          { label: t('forum.tabs.browse', 'Browse Threads'), to: '/forum' },
          { label: t('forum.tabs.create', 'Create Thread'), to: '/forum' },
          { label: t('forum.tabs.mine', 'My Posts'), to: '/forum' },
        ],
      },
    ],
    [t, user, hasMentorProfile]
  );

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.requiresAuth && !isAuthenticated) return false;
        if (item.allowedRoles?.length && (!user?.role || !item.allowedRoles.includes(user.role as Role))) {
          return false;
        }
        return true;
      }),
    }))
    .filter((section) => (section.requiresAuth ? isAuthenticated : true));

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileSection = (key: string) => {
    setOpenMobileSection((prev) => (prev === key ? null : key));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-14 md:h-16 items-center px-4 md:px-6">
        <div className="flex flex-1 items-center gap-4">
          <Link to="/" className="text-lg md:text-xl font-bold" aria-label="Go to home">
            {t('layout.header.brand')}
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
            {filteredSections.map((section) => {
              if (section.key === 'forum') {
                return (
                  <Button
                    key={section.key}
                    variant="ghost"
                    className="flex items-center gap-1 font-semibold"
                    asChild
                    aria-label={section.label}
                  >
                    <Link to={section.items[0]?.to ?? '/forum'}>{section.label}</Link>
                  </Button>
                );
              }

              return (
                <DropdownMenu key={section.key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 font-semibold"
                      aria-haspopup="menu"
                      aria-label={`${section.label} menu`}
                    >
                      <span>{section.label}</span>
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {section.items.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <Link to={item.to} aria-label={item.label}>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
            {user?.role === 'ROLE_ADMIN' && (
              <Button variant="ghost" asChild className="font-semibold">
                <Link to="/admin/reports" aria-label="Admin Panel">
                  Admin
                </Link>
              </Button>
            )}
          </nav>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('layout.header.nav.settings', 'Settings')}>
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="space-y-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t('layout.header.theme', 'Theme')}</span>
                <ThemeToggle />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{t('layout.header.language', 'Language')}</span>
                <LanguageSwitcher />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" asChild aria-label="Login">
                <Link to="/login">{t('layout.header.auth.login')}</Link>
              </Button>
              <Button asChild aria-label="Register">
                <Link to="/register">{t('layout.header.auth.signup')}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button className="size-12" variant="ghost" asChild aria-label={t('layout.header.auth.profile', 'My Profile')}>
                <Link to="/profile">
                  <Avatar className="size-8">
                    {/* Future: use user.avatarUrl when available */}
                    <AvatarImage src={undefined} alt={user?.username ?? 'User'} />
                    <AvatarFallback>
                      {(user?.username ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} aria-label="Logout">
                {t('layout.header.auth.logout')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
              aria-haspopup="true"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle>{t('layout.header.menu') || 'Menu'}</SheetTitle>
            </SheetHeader>

            <div className="mt-4 flex flex-col gap-3" role="navigation" aria-label="Mobile navigation">
              {isAuthenticated && (
                <div className="flex items-center justify-start">
                  <NotificationBell />
                </div>
              )}
              {filteredSections.map((section) => {
                const isOpen = openMobileSection === section.key;
                return (
                  <div key={section.key} className="rounded-md border">
                    <button
                      type="button"
                      onClick={() => toggleMobileSection(section.key)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold hover:bg-muted"
                      aria-expanded={isOpen}
                      aria-controls={`${section.key}-panel`}
                    >
                      <span>{section.label}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        aria-hidden
                      />
                    </button>
                    <div
                      id={`${section.key}-panel`}
                      hidden={!isOpen}
                      className="px-2 pb-3"
                      role="region"
                      aria-label={`${section.label} links`}
                    >
                      <div className="flex flex-col gap-1">
                        {section.items.map((item) => (
                          <Button
                            key={item.label}
                            variant="ghost"
                            className="justify-start"
                            asChild
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label={item.label}
                          >
                            <Link to={item.to}>{item.label}</Link>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              <Separator className="my-2" />

              <div className="rounded-md border">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('settings')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold hover:bg-muted"
                  aria-expanded={openMobileSection === 'settings'}
                  aria-controls="settings-panel"
                >
                  <span>{t('layout.header.nav.settings', 'Settings')}</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openMobileSection === 'settings' ? 'rotate-90' : ''}`}
                    aria-hidden
                  />
                </button>
                <div
                  id="settings-panel"
                  hidden={openMobileSection !== 'settings'}
                  className="px-3 pb-3 space-y-3"
                  role="region"
                  aria-label={t('layout.header.nav.settings', 'Settings')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t('layout.header.theme', 'Theme')}</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t('layout.header.language', 'Language')}</span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!isAuthenticated ? (
                  <>
                    <Button variant="outline" asChild aria-label="Login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link to="/login">{t('layout.header.auth.login')}</Link>
                    </Button>
                    <Button asChild aria-label="Register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link to="/register">{t('layout.header.auth.signup')}</Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleLogout} aria-label="Logout">
                    {t('layout.header.auth.logout')}
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

