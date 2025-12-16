import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Shield, Lock, Eye, UserCheck, FileCheck } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('info.privacy.title') || 'Privacy Policy'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('info.privacy.lastUpdated') || 'Last Updated: January 2025'}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {t('info.privacy.intro.title') || 'Our Commitment to Privacy'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.privacy.intro.content') ||
                'At Ethica Jobs, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. We are committed to protecting your personal data and being transparent about our practices.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.privacy.intro.content2') ||
                'By using Ethica Jobs, you agree to the collection and use of information in accordance with this policy. We will only use your personal information as described in this Privacy Policy and in ways that are consistent with our ethical values.'}
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              {t('info.privacy.collect.title') || 'Information We Collect'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('info.privacy.collect.personal.title') || 'Personal Information'}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground mb-2">
                {t('info.privacy.collect.personal.content') ||
                  'When you create an account or use our services, we may collect:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>{t('info.privacy.collect.personal.name') || 'Name, email address, and contact information'}</li>
                <li>{t('info.privacy.collect.personal.profile') || 'Profile information, including work experience, education, and skills'}</li>
                <li>{t('info.privacy.collect.personal.preferences') || 'Account preferences and settings'}</li>
                <li>{t('info.privacy.collect.personal.credentials') || 'Authentication credentials (securely hashed)'}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('info.privacy.collect.usage.title') || 'Usage Data'}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('info.privacy.collect.usage.content') ||
                  'We automatically collect information about how you interact with our platform, including pages visited, searches performed, and features used. This helps us improve our services and user experience.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              {t('info.privacy.use.title') || 'How We Use Your Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 list-disc list-inside text-base leading-relaxed">
              <li>
                {t('info.privacy.use.service') ||
                  'To provide, maintain, and improve our job board and related services'}
              </li>
              <li>
                {t('info.privacy.use.communication') ||
                  'To communicate with you about your account, applications, and important platform updates'}
              </li>
              <li>
                {t('info.privacy.use.matching') ||
                  'To match job seekers with relevant opportunities based on skills and preferences'}
              </li>
              <li>
                {t('info.privacy.use.analytics') ||
                  'To analyze usage patterns and enhance the user experience'}
              </li>
              <li>
                {t('info.privacy.use.security') ||
                  'To detect, prevent, and address technical issues, security threats, or fraudulent activity'}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              {t('info.privacy.security.title') || 'Data Security'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed">
              {t('info.privacy.security.content') ||
                'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.'}
            </p>
            <p className="text-base leading-relaxed">
              {t('info.privacy.security.content2') ||
                'We use industry-standard encryption, secure authentication practices, and regular security audits to safeguard your data. We also limit access to personal information to employees, contractors, and service providers who need it to perform their duties.'}
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              {t('info.privacy.rights.title') || 'Your Privacy Rights'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base leading-relaxed mb-3">
              {t('info.privacy.rights.intro') ||
                'You have the right to:'}
            </p>
            <ul className="space-y-2 list-disc list-inside text-base leading-relaxed">
              <li>{t('info.privacy.rights.access') || 'Access and review your personal information'}</li>
              <li>{t('info.privacy.rights.update') || 'Update or correct inaccurate information'}</li>
              <li>{t('info.privacy.rights.delete') || 'Request deletion of your account and personal data'}</li>
              <li>{t('info.privacy.rights.export') || 'Export your data in a portable format'}</li>
              <li>{t('info.privacy.rights.optout') || 'Opt-out of certain communications and data processing activities'}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed mb-2">
              {t('info.privacy.contact.intro') ||
                'If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:'}
            </p>
            <p className="text-base font-medium">
              {t('info.privacy.contact.email') || 'privacy@ethicajobs.com'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

