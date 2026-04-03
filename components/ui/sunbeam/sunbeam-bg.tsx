export type BeamProps = {
  styles: React.CSSProperties;
};

export const SUNBEAM_COLOR = "hsl(var(--primary))";
const SUNBEAM_TRANSPARENT =
  "color-mix(in srgb, hsl(var(--background)) 0%, transparent)";

export function sunbeamGradient(direction: string) {
  return `linear-gradient(${direction}, ${SUNBEAM_COLOR} 0%, ${SUNBEAM_COLOR} 40%, ${SUNBEAM_TRANSPARENT} 80%, ${SUNBEAM_TRANSPARENT} 100%)`;
}

const baseBeamStyles: React.CSSProperties = {
  content: '""',
  position: "absolute",
  left: "0",
  width: "100%",
  zIndex: "-1",
  opacity: "0.3",
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
          <div key={index} style={{ ...baseBeamStyles, ...beam.styles }} />
        ))}
      </div>
      {children}
    </div>
  );
}
