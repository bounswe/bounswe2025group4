import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '../ThemeToggle';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-12 md:h-16 items-center px-5">
          <div className="flex flex-1 items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Ethica Jobs</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/jobs">Jobs</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/mentorship">Mentorship</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/forum">Forum</Link>
              </Button>
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/">Register</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-2/3">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-2">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)}>Jobs</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/mentorship" onClick={() => setIsMobileMenuOpen(false)}>Mentorship</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/forum" onClick={() => setIsMobileMenuOpen(false)}>Forum</Link>
                </Button>
              </nav>

              <div className="flex flex-col gap-2 p-2 border-t">
                <Button variant="outline" asChild>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
