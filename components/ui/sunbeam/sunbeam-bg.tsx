export type BeamProps = {
  styles: React.CSSProperties;
};

export default function SunbeamBackground({
  children,
  beams,
}: {
  children: React.ReactNode;
  beams?: BeamProps[] | null;
}) {
  return (
    <div className="snap-always snap-start">
      <div className="-z-50 relative top-0 left-0 w-full overflow-visible">
        {beams?.map((beam, index) => (
          <div key={index} style={beam.styles} />
        ))}
      </div>
      {children}
    </div>
  );
}

export function LegacySunbeamBackground() {
  return (
    <div className="-z-50 relative top-0 left-0 w-full">
      <div className="beam-3" />
      <div className="beam-4" />
      <div className="beam-5" />
      <div className="beam-6" />
    </div>
  );
}
