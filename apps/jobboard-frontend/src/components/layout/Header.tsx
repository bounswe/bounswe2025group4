import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 max-w-7xl">
        <div className="flex flex-1 items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Ethica Jobs</span>
          </Link>
          <nav className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
