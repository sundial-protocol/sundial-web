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
    <div>
      <div className="-z-50 relative top-0 left-0 w-full overflow-visible">
        {beams?.map((beam, index) => (
          <div key={index} style={beam.styles} />
        ))}
      </div>
      {children}
    </div>
  );
}
