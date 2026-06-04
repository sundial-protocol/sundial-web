"use client";

import { C } from "./constants";
import { fmtUsd } from "./format";

export function VaultGauge({
  vaultUsd,
  firePool,
  iceL,
}: {
  vaultUsd: number;
  firePool: number;
  iceL: number;
}) {
  const VG_MAX = 4_000_000;
  const VG_TOP = 62;
  const VG_BOT = 393;
  const VG_H = VG_BOT - VG_TOP;

  const dollarsToHeight = (d: number) =>
    (Math.max(0, Math.min(d, VG_MAX)) / VG_MAX) * VG_H;
  const dollarsToY = (d: number) => VG_BOT - dollarsToHeight(d);

  const iceCovered = Math.max(0, Math.min(iceL, vaultUsd));
  const iceH = dollarsToHeight(iceCovered);
  const iceY = VG_BOT - iceH;
  const fireH = dollarsToHeight(Math.max(0, firePool));
  const fireY = iceY - fireH;

  const claimY = dollarsToY(iceL);
  const vaultY = dollarsToY(vaultUsd);

  return (
    <div
      style={{
        background: C.bgDeep,
        border: `1px solid ${C.cardEdge}`,
        borderRadius: 8,
        padding: "12px 8px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <svg
        viewBox="0 0 220 440"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto", maxWidth: 240 }}
        aria-label="Vault gauge"
      >
        <defs>
          <linearGradient id="vgFire" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB347" />
            <stop offset="100%" stopColor="#C8350A" />
          </linearGradient>
          <linearGradient id="vgIce" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A6DBF5" />
            <stop offset="100%" stopColor="#1F6FA8" />
          </linearGradient>
          <linearGradient id="vgGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#152846" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0A1628" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#152846" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <text
          x="110"
          y="20"
          textAnchor="middle"
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="10"
          fill={C.muted}
          letterSpacing="3"
        >
          THE VAULT
        </text>
        <text
          x="110"
          y="42"
          textAnchor="middle"
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="22"
          fill={C.btc}
          fontWeight="bold"
        >
          {fmtUsd(vaultUsd)}
        </text>

        <g fontFamily="Trebuchet MS, sans-serif" fontSize="9" fill={C.dim}>
          <text x="183" y="65" textAnchor="start">
            $4M
          </text>
          <text x="183" y="148" textAnchor="start">
            $3M
          </text>
          <text x="183" y="231" textAnchor="start">
            $2M
          </text>
          <text x="183" y="313" textAnchor="start">
            $1M
          </text>
          <text x="183" y="397" textAnchor="start">
            $0
          </text>
        </g>
        <g stroke={C.cardEdge} strokeWidth="1" opacity="0.5">
          <line x1="172" y1="62" x2="180" y2="62" />
          <line x1="172" y1="145" x2="180" y2="145" />
          <line x1="172" y1="227" x2="180" y2="227" />
          <line x1="172" y1="310" x2="180" y2="310" />
          <line x1="172" y1="393" x2="180" y2="393" />
        </g>

        <rect
          x="50"
          y="60"
          width="120"
          height="335"
          rx="12"
          fill="#0A1628"
          stroke={C.cardEdge}
          strokeWidth="2"
        />
        <rect
          x="52"
          y="62"
          width="116"
          height="331"
          rx="11"
          fill="url(#vgGlass)"
          opacity="0.5"
        />
        <rect
          x="42"
          y="56"
          width="136"
          height="9"
          rx="3"
          fill={C.cardEdge}
          stroke={C.charms}
          strokeWidth="1"
        />

        <rect
          x="52"
          y={iceY}
          width="116"
          height={iceH}
          fill="url(#vgIce)"
          style={{ transition: "all 0.25s ease" }}
        />
        <rect
          x="52"
          y={fireY}
          width="116"
          height={fireH}
          fill="url(#vgFire)"
          style={{ transition: "all 0.25s ease" }}
        />

        <line
          x1="46"
          x2="174"
          y1={claimY}
          y2={claimY}
          stroke={C.ice}
          strokeWidth="1.4"
          strokeDasharray="4 3"
          opacity="0.85"
          style={{ transition: "all 0.25s ease" }}
        />
        <text
          x="36"
          y={claimY + 3}
          textAnchor="end"
          fontFamily="Trebuchet MS, sans-serif"
          fontSize="9"
          fill={C.ice}
        >
          L
        </text>

        <line
          x1="42"
          x2="178"
          y1={vaultY}
          y2={vaultY}
          stroke={C.btc}
          strokeWidth="2"
          style={{ transition: "all 0.25s ease" }}
        />
        <polygon
          points={`38,${vaultY} 44,${vaultY - 3.5} 44,${vaultY + 3.5}`}
          fill={C.btc}
          style={{ transition: "all 0.25s ease" }}
        />

        {fireH > 16 && (
          <text
            x="110"
            y={fireY + fireH / 2 + 4}
            textAnchor="middle"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="10"
            fill="#0A1628"
            fontWeight="bold"
          >
            FIRE {fmtUsd(Math.max(0, firePool))}
          </text>
        )}
        {iceH > 16 && (
          <text
            x="110"
            y={iceY + iceH / 2 + 4}
            textAnchor="middle"
            fontFamily="Trebuchet MS, sans-serif"
            fontSize="10"
            fill="#0A1628"
            fontWeight="bold"
          >
            ICE {fmtUsd(iceL)}
          </text>
        )}

        <g fontFamily="Trebuchet MS, sans-serif" fontSize="9" letterSpacing="1">
          <rect x="22" y="412" width="10" height="10" fill="url(#vgFire)" />
          <text x="36" y="421" fill={C.muted}>
            FIRE pool
          </text>
          <rect x="100" y="412" width="10" height="10" fill="url(#vgIce)" />
          <text x="114" y="421" fill={C.muted}>
            ICE liability
          </text>
        </g>
      </svg>
    </div>
  );
}
