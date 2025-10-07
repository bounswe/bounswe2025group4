import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <>
      <Separator />
      <footer className="mt-auto border-t bg-muted/40">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              Copyright © {new Date().getFullYear()}{' '}
              <a
                href="/"
                className="hover:text-foreground transition-colors font-medium"
              >
                Job Listing Platform
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}