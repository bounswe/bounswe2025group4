import { Facebook, Instagram, Linkedin, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Copyright © {new Date().getFullYear()}{' '}
            <Link to="/" className="hover:text-foreground transition-colors font-medium">
              Job Listing Platform
            </Link>
            . All rights reserved.
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
      </div>
    </footer>
  );
}
