import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Heart, Globe, Users, Target, Shield, Handshake } from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('info.about.title') || 'About Ethica Jobs'}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('info.about.subtitle') || 'Connecting job seekers with ethical employers who share their values'}
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              {t('info.about.mission.title') || 'Our Mission'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.about.mission.content') || 
                'Ethica Jobs is dedicated to transforming the job market by connecting job seekers with employers who prioritize ethical practices, social responsibility, and positive workplace cultures. We believe that everyone deserves to work for organizations that align with their personal values and contribute meaningfully to society.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.about.mission.content2') ||
                'Our platform goes beyond traditional job boards by highlighting employers committed to diversity and inclusion, environmental sustainability, fair labor practices, and community engagement. We empower job seekers to make informed decisions about where they invest their time and talent.'}
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              {t('info.about.values.title') || 'Our Core Values'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t('info.about.values.transparency.title') || 'Transparency'}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t('info.about.values.transparency.content') ||
                    'We provide clear, accurate information about employers, including their ethical commitments, workplace practices, and community impact. Job seekers deserve honesty about the companies they consider joining.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t('info.about.values.inclusion.title') || 'Inclusion & Diversity'}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t('info.about.values.inclusion.content') ||
                    'We celebrate and promote workplaces that embrace diversity in all its forms. We believe that inclusive teams are stronger, more innovative, and better equipped to solve complex challenges.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  {t('info.about.values.fairness.title') || 'Fair Labor Practices'}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t('info.about.values.fairness.content') ||
                    'We support employers who offer fair wages, safe working conditions, opportunities for professional growth, and respect for workers\' rights. Everyone deserves dignity in the workplace.'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('info.about.values.community.title') || 'Community Impact'}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t('info.about.values.community.content') ||
                    'We highlight organizations that give back to their communities, support local initiatives, and create positive social change. We believe businesses have a responsibility to contribute to the common good.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('info.about.offer.title') || 'What We Offer'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 list-disc list-inside text-base leading-relaxed">
              <li>
                {t('info.about.offer.jobs') ||
                  'Curated job listings from employers verified for their ethical practices and commitments'}
              </li>
              <li>
                {t('info.about.offer.workplaces') ||
                  'Detailed workplace profiles showcasing company values, culture, and ethical initiatives'}
              </li>
              <li>
                {t('info.about.offer.mentorship') ||
                  'Mentorship opportunities connecting job seekers with experienced professionals in their field'}
              </li>
              <li>
                {t('info.about.offer.community') ||
                  'A supportive community forum for discussing career development, workplace ethics, and industry trends'}
              </li>
              <li>
                {t('info.about.offer.volunteering') ||
                  'Volunteering opportunities with nonprofit organizations making a difference in their communities'}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Closing */}
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed text-center">
              {t('info.about.closing') ||
                'Join us in building a job market where values matter. Together, we can create workplaces that not only succeed economically but also contribute to a better world.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

