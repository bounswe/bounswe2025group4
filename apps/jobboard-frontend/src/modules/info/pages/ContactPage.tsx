import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Mail, MessageCircle, HelpCircle, Bug, FileText } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('info.contact.title') || 'Contact Us'}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('info.contact.subtitle') || 'We\'d love to hear from you'}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed">
              {t('info.contact.intro') ||
                'At Ethica Jobs, we\'re committed to providing the best possible experience for job seekers and employers alike. Whether you have questions, feedback, or need assistance, we\'re here to help. Your input helps us improve our platform and better serve our community.'}
            </p>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t('info.contact.general.title') || 'General Inquiries'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('info.contact.general.description') ||
                  'For general questions about our platform, features, or how to get started:'}
              </p>
              <p className="text-base font-medium">
                {t('info.contact.general.email') || 'info@ethicajobs.com'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                {t('info.contact.support.title') || 'Technical Support'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('info.contact.support.description') ||
                  'Need help with your account, password reset, or technical issues?'}
              </p>
              <p className="text-base font-medium">
                {t('info.contact.support.email') || 'support@ethicajobs.com'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {t('info.contact.feedback.title') || 'Feedback & Suggestions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('info.contact.feedback.description') ||
                  'Share your ideas, suggestions, or feedback to help us improve:'}
              </p>
              <p className="text-base font-medium">
                {t('info.contact.feedback.email') || 'feedback@ethicajobs.com'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-primary" />
                {t('info.contact.bug.title') || 'Report a Bug'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('info.contact.bug.description') ||
                  'Found a bug or experiencing issues? Please let us know:'}
              </p>
              <p className="text-base font-medium">
                {t('info.contact.bug.email') || 'bugs@ethicajobs.com'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Employer Partnerships */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('info.contact.partnerships.title') || 'Employer Partnerships'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base leading-relaxed">
              {t('info.contact.partnerships.content') ||
                'Are you an employer committed to ethical practices and looking to connect with values-driven job seekers? We\'d love to partner with you. Please reach out to discuss how we can help showcase your organization\'s commitment to ethics and attract talented individuals who share your values.'}
            </p>
            <p className="text-base font-medium">
              {t('info.contact.partnerships.email') || 'partnerships@ethicajobs.com'}
            </p>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {t('info.contact.response') ||
                'We typically respond to all inquiries within 1-2 business days. Thank you for your patience and for being part of the Ethica Jobs community!'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

