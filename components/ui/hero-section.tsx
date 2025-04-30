export function HeroSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-12 md:py-16 bg-secondary">
      <div className="container px-4 md:px-6">{children}</div>
    </section>
  );
}
