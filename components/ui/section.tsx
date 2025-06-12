export function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-12 md:py-24">
      <div className="container px-0 md:px-6">{children}</div>
    </section>
  );
}
