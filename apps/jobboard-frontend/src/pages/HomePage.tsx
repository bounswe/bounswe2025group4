import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700">
        {/* Background overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop')",
          }}
        />

        <div className="relative z-10 w-full px-4 py-16 text-center">
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
            <div className="flex gap-2 bg-white rounded-lg p-2 shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-2">
                <Search className="text-gray-400 size-5" />
                <Input
                  type="text"
                  placeholder="Search for jobs, e.g. 'Software Engineer'"
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quote Box */}
      <section className="container mx-auto px-4 -mt-12 relative z-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl text-blue-600">&ldquo;</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">
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
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            For Job Seekers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering Your Career Journey. We provide the tools and resources
            you need to find a fulfilling career that aligns with your values.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="text-blue-600 size-6" />
              </div>
              <CardTitle>Ethical Job Listings</CardTitle>
              <CardDescription>
                Browse a curated list of job openings from companies committed
                to ethical practices and social responsibility.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600 size-6" />
              </div>
              <CardTitle>Career Development Resources</CardTitle>
              <CardDescription>
                Access resources to enhance your skills, including resume
                workshops, interview tips, and career coaching.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="text-blue-600 size-6" />
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
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Employers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Building a Better Workforce. Connect with talented individuals who
              are passionate about making a difference.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="text-blue-600 size-6" />
                </div>
                <CardTitle>Attract Top Talent</CardTitle>
                <CardDescription>
                  Connect with purpose-driven professionals who are passionate
                  about making a difference.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="text-blue-600 size-6" />
                </div>
                <CardTitle>Showcase Your Values</CardTitle>
                <CardDescription>
                  Highlight your company's commitment to ethics, sustainability,
                  and social impact.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="text-blue-600 size-6" />
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
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Ethical Careers Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up today to start your journey towards a more meaningful and
            impactful career.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}
