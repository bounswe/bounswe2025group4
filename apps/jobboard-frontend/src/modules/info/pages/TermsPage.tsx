import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { FileText, Scale, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('info.terms.title') || 'Terms of Service'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('info.terms.lastUpdated') || 'Last Updated: January 2025'}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {t('info.terms.intro.title') || 'Agreement to Terms'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.terms.intro.content') ||
                'Welcome to Ethica Jobs. These Terms of Service ("Terms") govern your access to and use of our platform, including our website, mobile applications, and related services (collectively, the "Service"). By accessing or using Ethica Jobs, you agree to be bound by these Terms.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.terms.intro.content2') ||
                'If you do not agree to these Terms, please do not use our Service. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Service after changes are posted constitutes your acceptance of the modified Terms.'}
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {t('info.terms.responsibilities.title') || 'User Responsibilities'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {t('info.terms.responsibilities.accuracy.title') || 'Accurate Information'}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('info.terms.responsibilities.accuracy.content') ||
                  'You agree to provide accurate, current, and complete information when creating an account or using our Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                {t('info.terms.responsibilities.conduct.title') || 'Acceptable Use'}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground mb-2">
                {t('info.terms.responsibilities.conduct.intro') ||
                  'You agree not to:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>{t('info.terms.responsibilities.conduct.spam') || 'Post false, misleading, or fraudulent information'}</li>
                <li>{t('info.terms.responsibilities.conduct.harassment') || 'Harass, threaten, or discriminate against other users'}</li>
                <li>{t('info.terms.responsibilities.conduct.illegal') || 'Use the Service for any illegal or unauthorized purpose'}</li>
                <li>{t('info.terms.responsibilities.conduct.violate') || 'Violate any applicable laws or regulations'}</li>
                <li>{t('info.terms.responsibilities.conduct.abuse') || 'Interfere with or disrupt the Service or servers'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings and Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {t('info.terms.jobs.title') || 'Job Listings and Applications'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.terms.jobs.content') ||
                'Ethica Jobs serves as a platform connecting job seekers with employers. We do not guarantee employment, and we are not responsible for the hiring decisions made by employers. Job seekers are responsible for verifying the legitimacy of job postings and employers before applying.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.terms.jobs.content2') ||
                'Employers are responsible for ensuring their job postings are accurate, comply with applicable employment laws, and reflect their genuine commitment to ethical practices. We reserve the right to remove any job posting or employer profile that violates our standards or these Terms.'}
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              {t('info.terms.ip.title') || 'Intellectual Property'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.terms.ip.content') ||
                'The Service and its original content, features, and functionality are owned by Ethica Jobs and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our Service without our prior written consent.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.terms.ip.content2') ||
                'You retain ownership of any content you post on our platform, but by posting content, you grant Ethica Jobs a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with operating and promoting our Service.'}
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('info.terms.disclaimer.title') || 'Disclaimer of Warranties'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.terms.disclaimer.content') ||
                'The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.terms.disclaimer.content2') ||
                'We do not guarantee the accuracy, completeness, or reliability of any job listings, employer profiles, or user-generated content. You use the Service at your own risk.'}
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('info.terms.liability.title') || 'Limitation of Liability'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">
              {t('info.terms.liability.content') ||
                'To the maximum extent permitted by law, Ethica Jobs shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.'}
            </p>
          </CardContent>
        </Card>

        {/* Ethical Standards */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('info.terms.ethical.title') || 'Our Commitment to Ethical Practices'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.terms.ethical.content') ||
                'As a platform dedicated to connecting job seekers with ethical employers, we hold ourselves to high standards. We are committed to fair treatment of all users, transparency in our practices, and promoting diversity, inclusion, and social responsibility.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.terms.ethical.content2') ||
                'We expect all users—both job seekers and employers—to share this commitment to ethical conduct. Violations of these principles may result in account suspension or termination.'}
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed mb-2">
              {t('info.terms.contact.intro') ||
                'If you have questions about these Terms of Service, please contact us at:'}
            </p>
            <p className="text-base font-medium">
              {t('info.terms.contact.email') || 'legal@ethicajobs.com'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

