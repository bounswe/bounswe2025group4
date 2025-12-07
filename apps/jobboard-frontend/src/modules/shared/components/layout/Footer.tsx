import { Facebook, Instagram, Linkedin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="container mx-auto px-4 py-6">
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">
              {t('layout.footer.about')}
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              {t('layout.footer.contact')}
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              {t('layout.footer.privacy')}
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              {t('layout.footer.terms')}
            </Link>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            <Link to="/" className="hover:text-foreground transition-colors font-medium">
              {t('layout.footer.brandSuffix')}
            </Link>
            {' - '}
            {new Date().getFullYear()}
          </p>

          <div className="flex gap-4 justify-end">
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook className="size-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="size-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="size-5" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col md:hidden items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            <Link to="/" className="hover:text-foreground transition-colors font-medium">
              {t('layout.footer.brandSuffix')} 
            </Link>
            {' - '}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

