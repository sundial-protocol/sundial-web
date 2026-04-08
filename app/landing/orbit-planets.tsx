"use client";

import { useEffect, useState } from "react";

type SmallPlanetProps = {
  angle: number;
  radius: number;
  color: string;
  speed?: number;
};

export function SmallPlanet({
  angle,
  radius,
  color,
  speed = 1,
}: SmallPlanetProps) {
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + speed * 0.1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [speed]);

  if (!mounted) return null;

  const cx = 170;
  const cy = 250 + radius / 7;
  const rx = radius;
  const ry = radius * Math.cos((75 * Math.PI) / 180);
  const rad = (currentAngle * Math.PI) / 180;
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);
  return <circle cx={x} cy={y} r={y * 0.05} fill={color} />;
}

export function ImagePlanet({
  angle,
  radius,
  speed = 1,
  imageUrl,
  size = 70,
}: {
  angle: number;
  radius: number;
  speed?: number;
  imageUrl: string;
  size?: number;
}) {
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentAngle((prev) => (prev + speed * 0.1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [speed]);

  if (!mounted) return null;

  const cx = 170;
  const cy = 250 + radius / 7;
  const rx = radius;
  const ry = radius * Math.cos((75 * Math.PI) / 180);
  const rad = (currentAngle * Math.PI) / 180;
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);
  const dynamicSize = size + (y - 300) * 0.2;

  return (
    <image
      href={imageUrl}
      x={x - dynamicSize / 2}
      y={y - dynamicSize / 2}
      width={dynamicSize}
      height={dynamicSize}
      style={{ filter: "url(#planet-glow)" }}
    />
  );
}
