import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-background.jpg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Search,
  Briefcase,
  Users,
  MessageCircle,
  Target,
  Heart,
  Globe,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const isMediumOrLarger = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');

  const handleHeroSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/jobs?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/jobs');
    }
  };

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
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content">
        {/* Daily Quote Box */}
        <section
          aria-label={t('home.quote.title')}
          className="container mx-auto px-4 -mt-12 relative z-20"
        >
          <Card className="max-w-4xl mx-auto">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl text-primary" aria-hidden="true">
                  &ldquo;
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-2">
                    {t('home.quote.title')}
                  </p>
                  <blockquote className="text-lg italic text-foreground/80">
                    {t('home.quote.text')}
                  </blockquote>
                  <p className="text-sm text-muted-foreground mt-2">
                    - {t('home.quote.author')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* For Job Seekers Section */}
        <section
          aria-labelledby="job-seekers-heading"
          className="container mx-auto px-4 py-16"
        >
        <div className="text-center mb-12">
          <h2 id="job-seekers-heading" className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.jobSeekers.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.jobSeekers.description')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Briefcase className="text-primary size-6" />
              </div>
              <CardTitle>{t('home.jobSeekers.cards.ethical.title')}</CardTitle>
              <CardDescription>
                {t('home.jobSeekers.cards.ethical.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Users className="text-primary size-6" />
              </div>
              <CardTitle>{t('home.jobSeekers.cards.resources.title')}</CardTitle>
              <CardDescription>
                {t('home.jobSeekers.cards.resources.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <MessageCircle className="text-primary size-6" />
              </div>
              <CardTitle>{t('home.jobSeekers.cards.community.title')}</CardTitle>
              <CardDescription>
                {t('home.jobSeekers.cards.community.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* For Employers Section */}
      <section
        aria-labelledby="employers-heading"
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="employers-heading" className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.employers.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.employers.description')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Target className="text-primary size-6" />
                </div>
                <CardTitle>{t('home.employers.cards.talent.title')}</CardTitle>
                <CardDescription>
                  {t('home.employers.cards.talent.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Heart className="text-primary size-6" />
                </div>
                <CardTitle>{t('home.employers.cards.values.title')}</CardTitle>
                <CardDescription>
                  {t('home.employers.cards.values.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Globe className="text-primary size-6" />
                </div>
                <CardTitle>{t('home.employers.cards.brand.title')}</CardTitle>
                <CardDescription>
                  {t('home.employers.cards.brand.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

        {/* CTA Section */}
        <section
          aria-labelledby="cta-heading"
          className="bg-primary/5 py-16"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('home.cta.description')}
            </p>
            <Button
              size="lg"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t('home.cta.button')}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
