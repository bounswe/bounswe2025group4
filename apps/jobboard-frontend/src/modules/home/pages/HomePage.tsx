import { Button } from '@shared/components/ui/button';
import heroBackground from '@/assets/hero-background.jpg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useAuth } from '@shared/contexts/AuthContext';
import {
  Search,
  Users,
  Briefcase,
  FileText,
  GraduationCap,
  Heart,
  Globe,
  MessageCircle,
  UserCheck,
} from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, type DashboardStatsResponse } from '@modules/employer/services/dashboard.service';

export default function HomePage() {
  const isMediumOrLarger = useMediaQuery('(min-width: 768px)');
  const { user, isAuthenticated } = useAuth();
  const isEmployer = user?.role === 'ROLE_EMPLOYER';
  const isJobSeeker = user?.role === 'ROLE_JOBSEEKER';
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatNumber = (value: number | null | undefined) => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value.toLocaleString();
    }
    return '0';
  };

  const renderStatsSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={`stats-skeleton-${index}`} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mb-4 animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const handleHeroSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/jobs?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/jobs');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        aria-label={t('home.hero.searchLabel')}
        className="relative z-10 min-h-[500px] flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700"
      >
        {/* Background overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
          }}
          aria-hidden="true"
        />

        <div className="relative z-20 w-full px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form
              role="search"
              aria-label={t('home.hero.searchLabel')}
              onSubmit={handleHeroSearch}
              className="flex gap-2 bg-card rounded-lg p-2 shadow-lg border border-border"
            >
              <div className="flex-1 flex items-center gap-2 px-2">
                <Search className="text-muted-foreground size-5" aria-hidden="true" />
                <label htmlFor="job-search-input" className="sr-only">
                  {t('home.hero.searchLabel')}
                </label>
                <Input
                  id="job-search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={
                    isMediumOrLarger
                      ? t('home.hero.searchPlaceholderDesktop')
                      : t('home.hero.searchPlaceholderMobile')
                  }
                  className="border-0 shadow-none focus-visible:ring-2 focus-visible:ring-primary text-base md:text-lg bg-transparent"
                  aria-label={t('home.hero.searchLabel')}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t('home.hero.searchButton')}
              </Button>
            </form>

            {/* Non-profit opportunities button */}
            <div className="mt-6 flex justify-center">
              <div
                className="group relative cursor-pointer"
                onClick={() => navigate('/nonprofit-jobs')}
              >
                {/* Strong Outer Glow */}
                <div
                  className="absolute inset-0 
                 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600
                 dark:from-blue-600 dark:via-indigo-600 dark:to-blue-700
                 opacity-70 blur-3xl
                 rounded-3xl
                 transition-all group-hover:opacity-95"
                ></div>

                {/* Inner Glow Layer (adds depth) */}
                <div
                  className="absolute inset-0 
                 bg-gradient-to-r from-blue-400/50 via-blue-500/40 to-indigo-500/40
                 dark:from-blue-700/40 dark:via-blue-600/40 dark:to-indigo-600/40
                 blur-xl rounded-2xl opacity-80
                 group-hover:opacity-100 transition-opacity"
                ></div>

                {/* Foreground Glass Card */}
                <div
                  className="relative 
                 bg-white/85 dark:bg-white/10
                 backdrop-blur-xl
                 border border-white/60 dark:border-white/10
                 shadow-2xl rounded-2xl
                 px-10 py-7
                 flex items-center gap-3
                 hover:scale-[1.03] active:scale-[0.98]
                 transition-all duration-300"
                >
                  <Heart className="size-6 text-blue-700 dark:text-blue-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('home.hero.discoverNonProfit')}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-aware quick links */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {isEmployer ? (
                <>
                  <Button variant="secondary" onClick={() => navigate('/employer/workplaces')}>
                    {t('header.nav.myWorkplaces')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/nonprofit-jobs')}>
                    {t('header.nav.nonProfitJobs')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/mentorship')}>
                    {t('header.nav.mentorship')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/forum')}>
                    {t('header.nav.forum')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => navigate('/jobs')}>
                    {t('header.nav.jobs')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/nonprofit-jobs')}>
                    {t('header.nav.nonProfitJobs')}
                  </Button>
                  {isAuthenticated && isJobSeeker && (
                    <Button variant="ghost" onClick={() => navigate('/applications')}>
                      {t('header.nav.myApplications')}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => navigate('/workplaces')}>
                    {t('header.nav.workplaces')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/mentorship')}>
                    {t('header.nav.mentorship')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/forum')}>
                    {t('header.nav.forum')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content">
        {/* Community Statistics Section */}
        <section
          id="stats-section"
          aria-labelledby="stats-heading"
          className="container mx-auto px-4 py-16"
        >
          <div className="text-center mb-12">
            <h2 id="stats-heading" className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.stats.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.stats.subtitle')}
            </p>
          </div>

          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t('home.stats.error')}</p>
              <Button onClick={fetchStats} variant="outline">
                {t('home.stats.retry')}
              </Button>
            </div>
          )}

          {loading && !error && renderStatsSkeleton()}

          {stats && !loading && !error && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Users Stats Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <Users className="text-primary size-6" />
                  </div>
                  <CardTitle className="text-lg">{t('home.stats.users.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-3">
                    {formatNumber(stats.totalUsers)}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('home.stats.users.employers')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.totalEmployers)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('home.stats.users.jobSeekers')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.totalJobSeekers)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs Stats Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <Briefcase className="text-primary size-6" />
                  </div>
                  <CardTitle className="text-lg">{t('home.stats.jobs.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-3">
                    {formatNumber(stats.totalJobPosts)}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('home.stats.jobs.remote')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.remoteJobsCount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('home.stats.jobs.inclusive')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.inclusiveJobsCount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('home.stats.jobs.newThisWeek')}</span>
                      <span className="font-medium text-green-600">
                        +{formatNumber(stats.newJobsThisWeekCount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications Stats Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <FileText className="text-primary size-6" />
                  </div>
                  <CardTitle className="text-lg">{t('home.stats.applications.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-3">
                    {formatNumber(stats.totalApplications)}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('home.stats.applications.pending')}</span>
                      <span className="font-medium text-yellow-600">
                        {formatNumber(stats.totalPendingApplications)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('home.stats.applications.accepted')}</span>
                      <span className="font-medium text-green-600">
                        {formatNumber(stats.totalAcceptedApplications)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mentorship Stats Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <GraduationCap className="text-primary size-6" />
                  </div>
                  <CardTitle className="text-lg">{t('home.stats.mentorship.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-3">
                    {formatNumber(stats.totalMentors)}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('home.stats.mentorship.accepted')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.acceptedMentorships)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('home.stats.mentorship.completed')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.completedMentorships)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('home.stats.mentorship.reviews')}</span>
                      <span className="font-medium text-foreground">
                        {formatNumber(stats.totalMentorReviews)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section aria-labelledby="features-heading" className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
                <CardHeader>
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <Heart className="text-primary size-6" />
                  </div>
                  <CardTitle>{t('home.features.ethical.title')}</CardTitle>
                  <CardDescription>{t('home.features.ethical.description')}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
                <CardHeader>
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <Globe className="text-primary size-6" />
                  </div>
                  <CardTitle>{t('home.features.inclusive.title')}</CardTitle>
                  <CardDescription>{t('home.features.inclusive.description')}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
                <CardHeader>
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <UserCheck className="text-primary size-6" />
                  </div>
                  <CardTitle>{t('home.features.mentorship.title')}</CardTitle>
                  <CardDescription>{t('home.features.mentorship.description')}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
                <CardHeader>
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
                    aria-hidden="true"
                  >
                    <MessageCircle className="text-primary size-6" />
                  </div>
                  <CardTitle>{t('home.features.community.title')}</CardTitle>
                  <CardDescription>{t('home.features.community.description')}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-labelledby="cta-heading" className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('home.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t('home.cta.signUp')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t('home.cta.login')}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
