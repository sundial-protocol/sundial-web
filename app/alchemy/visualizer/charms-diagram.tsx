"use client";

import { C } from "./constants";

export function CharmsDiagram() {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${C.bg} 0%, #04080F 100%)`,
        border: `1px solid ${C.cardEdge}`,
        borderLeft: `4px solid ${C.btc}`,
        borderRadius: 8,
        padding: 24,
        textAlign: "center",
        marginBottom: 28,
      }}
    >
      <svg
        viewBox="0 0 920 470"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", maxWidth: 920, height: "auto" }}
        aria-label="The Two Charms diagram"
      >
        <defs>
          <radialGradient id="btcAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F7931A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F7931A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fireHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="iceHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5BC0EB" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#5BC0EB" stopOpacity="0" />
          </radialGradient>
        </defs>

        <text
          x="460"
          y="42"
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="22"
          fill={C.white}
          textAnchor="middle"
          fontWeight="bold"
          letterSpacing="3"
        >
          Ignite your Bitcoin. Or freeze it.
        </text>
        <text
          x="460"
          y="68"
          fontFamily="Calibri, sans-serif"
          fontSize="13"
          fill={C.muted}
          textAnchor="middle"
          fontStyle="italic"
          letterSpacing="1"
        >
          Two ancient charms. One shared Bitcoin reserve.
        </text>

        <g fill={C.white} opacity="0.5">
          <circle cx="100" cy="120" r="1.2" />
          <circle cx="850" cy="100" r="1" />
          <circle cx="180" cy="380" r="1" />
          <circle cx="780" cy="360" r="1.2" />
          <circle cx="450" cy="110" r="0.9" />
          <circle cx="60" cy="230" r="1" />
          <circle cx="880" cy="250" r="1" />
          <circle cx="380" cy="420" r="0.9" />
          <circle cx="560" cy="420" r="1.1" />
        </g>

        <path
          d="M 410,250 Q 350,205 290,225"
          stroke="#FF6A1A"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="5 5"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 510,250 Q 570,205 630,225"
          stroke="#5BC0EB"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="5 5"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* LEFT: Ignite Charm */}
        <g transform="translate(220,250)">
          <circle r="130" fill="url(#fireHalo)" />
          <circle
            r="100"
            fill="none"
            stroke="#FF6A1A"
            strokeWidth="1.5"
            opacity="0.55"
          />
          <g fill="#FF6A1A" opacity="0.85">
            <circle cx="0" cy="-100" r="2.5" />
            <circle cx="71" cy="-71" r="2" />
            <circle cx="100" cy="0" r="2.5" />
            <circle cx="71" cy="71" r="2" />
            <circle cx="0" cy="100" r="2.5" />
            <circle cx="-71" cy="71" r="2" />
            <circle cx="-100" cy="0" r="2.5" />
            <circle cx="-71" cy="-71" r="2" />
          </g>
          <image
            href="/alchemy/v2-fire.png"
            x="-85"
            y="-85"
            width="170"
            height="170"
          />
          <text
            y="125"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="11"
            fill={C.muted}
            textAnchor="middle"
            letterSpacing="5"
          >
            THE IGNITE CHARM
          </text>
          <text
            y="151"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="26"
            fill="#FF6A1A"
            textAnchor="middle"
            fontWeight="bold"
            letterSpacing="4"
          >
            → FIRE
          </text>
          <text
            y="175"
            fontFamily="Calibri, sans-serif"
            fontSize="12"
            fill={C.muted}
            textAnchor="middle"
            fontStyle="italic"
          >
            Volatile · captures BTC&apos;s swings
          </text>
        </g>

        {/* RIGHT: Freeze Charm */}
        <g transform="translate(700,250)">
          <circle r="130" fill="url(#iceHalo)" />
          <circle
            r="100"
            fill="none"
            stroke="#5BC0EB"
            strokeWidth="1.5"
            opacity="0.55"
          />
          <g fill="#5BC0EB" opacity="0.85">
            <polygon points="0,-103 -3,-96 3,-96" />
            <polygon points="71,-71 67,-65 75,-65" />
            <polygon points="103,0 96,-3 96,3" />
            <polygon points="71,71 65,67 65,75" />
            <polygon points="0,103 3,96 -3,96" />
            <polygon points="-71,71 -75,65 -67,65" />
            <polygon points="-103,0 -96,3 -96,-3" />
            <polygon points="-71,-71 -65,-67 -65,-75" />
          </g>
          <image
            href="/alchemy/v2-ice.png"
            x="-85"
            y="-85"
            width="170"
            height="170"
          />
          <text
            y="125"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="11"
            fill={C.muted}
            textAnchor="middle"
            letterSpacing="5"
          >
            THE FREEZE CHARM
          </text>
          <text
            y="151"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="26"
            fill="#5BC0EB"
            textAnchor="middle"
            fontWeight="bold"
            letterSpacing="4"
          >
            → ICE
          </text>
          <text
            y="175"
            fontFamily="Calibri, sans-serif"
            fontSize="12"
            fill={C.muted}
            textAnchor="middle"
            fontStyle="italic"
          >
            Stable · locked at a fixed dollar weight
          </text>
        </g>

        {/* CENTER: Bitcoin */}
        <g transform="translate(460,250)">
          <circle r="90" fill="url(#btcAura)" />
          <image
            href="/icons/btc.jpg"
            x="-58"
            y="-58"
            width="116"
            height="116"
          />
          <text
            y="92"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="11"
            fill={C.btc}
            textAnchor="middle"
            fontWeight="bold"
            letterSpacing="5"
          >
            YOUR BITCOIN
          </text>
        </g>

        <text
          x="460"
          y="442"
          fontFamily="Calibri, sans-serif"
          fontSize="13"
          fill={C.muted}
          textAnchor="middle"
          fontStyle="italic"
        >
          Cast a charm. Choose how your Bitcoin behaves.
        </text>
      </svg>
    </div>
  );
}
