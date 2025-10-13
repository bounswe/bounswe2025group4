export default function HomePage() {
  return (
    <div className="space-y-8 py-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Hero Section */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find Your Next Ethical Career Move
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect with employers who share your values and make a positive impact through your
            work.
          </p>
        </div>

        {/* Quote Section - Optional placeholder */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium">Daily Quote</p>
            <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
              "The future belongs to those who believe in the beauty of their dreams."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
