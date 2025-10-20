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
export default function HomePage() {
  const isMediumOrLarger = useMediaQuery('(min-width: 768px)');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        aria-label="Hero section with job search"
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
            Find Your Purpose-Driven Career
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Connect with companies that prioritize ethics and sustainability.
            Discover opportunities that align with your values and make a
            positive impact on the world.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form
              role="search"
              aria-label="Job search form"
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 bg-card rounded-lg p-2 shadow-lg border border-border"
            >
              <div className="flex-1 flex items-center gap-2 px-2">
                <Search className="text-muted-foreground size-5" aria-hidden="true" />
                <label htmlFor="job-search-input" className="sr-only">
                  Search for jobs
                </label>
                <Input
                  id="job-search-input"
                  type="search"
                  placeholder={isMediumOrLarger ? "Search for jobs, e.g. 'Software Engineer'" : "Search for jobs"}
                  className="border-0 shadow-none focus-visible:ring-2 focus-visible:ring-primary text-base md:text-lg bg-transparent"
                  aria-label="Job search input"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content">
        {/* Daily Quote Box */}
        <section
          aria-label="Daily inspirational quote"
          className="container mx-auto px-4 -mt-12 relative z-100"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl text-primary" aria-hidden="true">
                  &ldquo;
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-2">
                    Daily Inspirational Quote
                  </p>
                  <blockquote className="text-lg italic text-gray-700">
                    The future belongs to those who believe in the beauty of their
                    dreams.
                  </blockquote>
                  <p className="text-sm text-gray-600 mt-2">
                    - Eleanor Roosevelt
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
            For Job Seekers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering Your Career Journey. We provide the tools and resources
            you need to find a fulfilling career that aligns with your values.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Briefcase className="text-primary size-6" />
              </div>
              <CardTitle>Ethical Job Listings</CardTitle>
              <CardDescription>
                Browse a curated list of job openings from companies committed
                to ethical practices and social responsibility.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <Users className="text-primary size-6" />
              </div>
              <CardTitle>Career Development Resources</CardTitle>
              <CardDescription>
                Access resources to enhance your skills, including resume
                workshops, interview tips, and career coaching.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                <MessageCircle className="text-primary size-6" />
              </div>
              <CardTitle>Community Forum</CardTitle>
              <CardDescription>
                Engage with a community of like-minded professionals, share
                insights, and network with ethical leaders.
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
              For Employers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Building a Better Workforce. Connect with talented individuals who
              are passionate about making a difference.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Target className="text-primary size-6" />
                </div>
                <CardTitle>Attract Top Talent</CardTitle>
                <CardDescription>
                  Connect with purpose-driven professionals who are passionate
                  about making a difference.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Heart className="text-primary size-6" />
                </div>
                <CardTitle>Showcase Your Values</CardTitle>
                <CardDescription>
                  Highlight your company's commitment to ethics, sustainability,
                  and social impact.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Globe className="text-primary size-6" />
                </div>
                <CardTitle>Build a Stronger Brand</CardTitle>
                <CardDescription>
                  Enhance your reputation and attract customers who value
                  ethical business practices.
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
              Join the Ethical Careers Community
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sign up today to start your journey towards a more meaningful and
              impactful career.
            </p>
            <Button
              size="lg"
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Get Started
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
