"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import InteractiveGradientBg from "@/components/ui/interactive-gradient-bg";
import { C } from "./constants";
import { fmtTokens, fmtUsd, fmt2, fmtPct, ratioToPct } from "./format";
import { VaultGauge } from "./vault-gauge";

export function VisualizerContent() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [price, setPrice] = useState(100000);
  const [vault, setVault] = useState(10);
  const [iceOut, setIceOut] = useState(200000);
  const [fireOut, setFireOut] = useState(1_000_000);

  const vaultUsd = vault * price;
  const ratio = iceOut > 0 ? vaultUsd / iceOut : Infinity;
  const firePool = vaultUsd - iceOut;
  const firePer = firePool / fireOut;

  // Zone
  let zoneName: string, zoneDesc: string, zoneColor: string;
  if (!isFinite(ratio) || ratio >= 4) {
    zoneName = "Healthy";
    zoneDesc = "FIRE redeemable · ICE mintable · ICE appreciation active.";
    zoneColor = C.healthy;
  } else if (ratio >= 2) {
    zoneName = "Buffer";
    zoneDesc =
      "New ICE minting paused · FIRE redemption paused · ICE appreciation continues.";
    zoneColor = C.buffer;
  } else {
    zoneName = "Locked";
    zoneDesc =
      "Below 2× · all minting and redemption paused · ICE appreciation continues.";
    zoneColor = C.locked;
  }

  const thermPct = ratioToPct(ratio);

  // Capital stack percentages
  const icePct = firePool > 0 && iceOut > 0 ? (iceOut / vaultUsd) * 100 : null;
  const firePct =
    firePool > 0 && iceOut > 0 ? (firePool / vaultUsd) * 100 : null;

  const scenarios = [
    { delta: -0.5, label: "BTC −50%" },
    { delta: 0.0, label: "BTC unchanged" },
    { delta: +1.0, label: "BTC +100%" },
  ];

  const sec: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.cardEdge}`,
    borderLeft: `4px solid ${C.charms}`,
    borderRadius: 8,
    padding: 32,
    marginBottom: 28,
    fontFamily: "'Calibri','Segoe UI',system-ui,sans-serif",
    lineHeight: 1.5,
    color: C.text,
  };
  const eyebrow: React.CSSProperties = {
    color: C.charms,
    fontFamily: "Trebuchet MS,sans-serif",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 5,
    textTransform: "uppercase",
    marginBottom: 8,
  };
  const h2s: React.CSSProperties = {
    color: C.white,
    fontSize: 28,
    marginBottom: 8,
    fontFamily: "Trebuchet MS,sans-serif",
    fontWeight: "bold",
  };
  const lede: React.CSSProperties = { color: C.muted, fontSize: 15 };

  const sliderCSS = `
    input[type="range"].viz-slider{width:100%;-webkit-appearance:none;appearance:none;height:6px;background:${C.bgDeep};border-radius:3px;outline:none;border:1px solid ${C.cardEdge}}
    input[type="range"].viz-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;background:${C.charms};border-radius:50%;cursor:pointer;border:2px solid ${C.bg};box-shadow:0 0 0 2px ${C.charms}}
    input[type="range"].viz-slider::-moz-range-thumb{width:18px;height:18px;background:${C.charms};border-radius:50%;cursor:pointer;border:2px solid ${C.bg}}
    @media(max-width:639px){
      .viz-sec{padding:18px!important}
      .viz-header-img{height:120px!important}
      .viz-h2{font-size:20px!important}
      .viz-eqn-num{font-size:16px!important}
      .viz-eq-grid{grid-template-columns:1fr!important}
      .viz-results-grid{grid-template-columns:1fr!important}
      .viz-sim-grid{grid-template-columns:1fr!important}
    }
    @media(min-width:640px) and (max-width:767px){
      .viz-sim-grid{grid-template-columns:1fr!important}
    }
  `;

  return (
    <InteractiveGradientBg>
      <div
        style={{
          color: C.text,
          fontFamily: "'Calibri','Segoe UI',system-ui,sans-serif",
          lineHeight: 1.5,
          paddingBottom: 40,
        }}
      >
        <style>{sliderCSS}</style>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isDark ? "/alchemy/v2-gold.png" : "/alchemy/v2-normal.png"}
              alt="Alchemy"
              className="viz-header-img"
              style={{ height: 180, width: "auto" }}
            />
          </div>
        </div>

        {/*<CharmsDiagram />*/}

        {/* Mathematics */}
        <div className="viz-sec" style={sec}>
          <div style={eyebrow}>The Mathematics</div>
          <h2 className="viz-h2" style={h2s}>
            Three equations describe the entire system.
          </h2>
          <div style={lede}>
            L = total ICE liability (USD), V = vault BTC, P = BTC price, N
            <sub>fire</sub> = FIRE supply.
          </div>

          <div
            className="viz-eq-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
              marginTop: 22,
            }}
          >
            {(
              [
                {
                  eqn: (
                    <>
                      <span style={{ color: C.charms, fontStyle: "italic" }}>
                        r
                      </span>{" "}
                      = (
                      <span style={{ color: C.btc, fontStyle: "italic" }}>
                        V·P
                      </span>
                      ) /{" "}
                      <span style={{ color: C.ice, fontStyle: "italic" }}>
                        L
                      </span>
                    </>
                  ),
                  lbl: (
                    <>
                      <strong>Reserve ratio</strong>
                      <br />
                      vault value ÷ ICE liability
                    </>
                  ),
                },
                {
                  eqn: (
                    <>
                      <span style={{ color: C.ice, fontStyle: "italic" }}>
                        ICE
                      </span>{" "}
                      = $<span style={{ fontStyle: "italic" }}>F</span>
                    </>
                  ),
                  lbl: (
                    <>
                      <strong>ICE redemption</strong>
                      <br />
                      fixed face value, paid in BTC at the spot price
                    </>
                  ),
                },
                {
                  eqn: (
                    <>
                      <span style={{ color: C.fire, fontStyle: "italic" }}>
                        FIRE
                      </span>{" "}
                      = (
                      <span style={{ color: C.btc, fontStyle: "italic" }}>
                        V·P
                      </span>{" "}
                      −{" "}
                      <span style={{ color: C.ice, fontStyle: "italic" }}>
                        L
                      </span>
                      ) /{" "}
                      <span style={{ fontStyle: "italic" }}>
                        N<sub>fire</sub>
                      </span>
                    </>
                  ),
                  lbl: (
                    <>
                      <strong>FIRE per token</strong>
                      <br />
                      residual vault value, split across FIRE supply
                    </>
                  ),
                },
              ] as { eqn: React.ReactNode; lbl: React.ReactNode }[]
            ).map((f, i) => (
              <div
                key={i}
                style={{
                  background: C.bgDeep,
                  border: `1px solid ${C.cardEdge}`,
                  borderRadius: 8,
                  padding: "22px 18px",
                  textAlign: "center",
                }}
              >
                <div
                  className="viz-eqn-num"
                  style={{
                    fontFamily: "Cambria,Georgia,serif",
                    fontSize: 22,
                    color: C.white,
                    marginBottom: 12,
                    letterSpacing: 1,
                  }}
                >
                  {f.eqn}
                </div>
                <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.4 }}>
                  {f.lbl}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              padding: "18px 22px",
              background: C.bgDeep,
              borderLeft: `3px solid ${C.charms}`,
              borderRadius: 6,
              color: C.text,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <strong>
              L stays constant in dollars while V·P moves with the market.
            </strong>{" "}
            So FIRE absorbs <em style={{ color: C.charms }}>all</em> the
            volatility of the vault, and a small percentage move in BTC produces
            a larger percentage move in FIRE - that&apos;s where the leverage
            comes from. Where the chaos goes, ICE stays still.
          </div>
        </div>

        {/* Live Simulator */}
        <div className="viz-sec" style={sec}>
          <div style={eyebrow}>Live Simulator</div>
          <h2 className="viz-h2" style={h2s}>
            Move the sliders. Watch the system respond.
          </h2>
          <div style={lede}>
            Each ICE token redeems for its USD face value at mint (minimum
            $100). FIRE tokens share whatever the vault holds beyond the ICE
            liability - change the supply to see dilution.
          </div>

          <div
            className="viz-sim-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "280px 220px 1fr",
              gap: 24,
              marginTop: 22,
              alignItems: "start",
            }}
          >
            {/* Controls */}
            <div>
              {(
                [
                  {
                    label: "BTC price",
                    val: `$${price.toLocaleString()}`,
                    min: 20000,
                    max: 300000,
                    step: 1000,
                    value: price,
                    set: setPrice,
                  },
                  {
                    label: "BTC in vault",
                    val: `${vault % 1 === 0 ? vault : vault.toFixed(1)} BTC`,
                    min: 1,
                    max: 50,
                    step: 0.5,
                    value: vault,
                    set: setVault,
                  },
                  {
                    label: "ICE outstanding",
                    val: fmtUsd(iceOut),
                    min: 0,
                    max: 2000000,
                    step: 10000,
                    value: iceOut,
                    set: setIceOut,
                  },
                  {
                    label: "FIRE outstanding",
                    val: fmtTokens(fireOut),
                    min: 100000,
                    max: 10000000,
                    step: 50000,
                    value: fireOut,
                    set: setFireOut,
                  },
                ] as {
                  label: string;
                  val: string;
                  min: number;
                  max: number;
                  step: number;
                  value: number;
                  set: (v: number) => void;
                }[]
              ).map((s) => (
                <div key={s.label} style={{ marginBottom: 22 }}>
                  <label
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      color: C.muted,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 10,
                    }}
                  >
                    <span>{s.label}</span>
                    <span
                      style={{
                        color: C.white,
                        fontFamily: "Trebuchet MS,sans-serif",
                        fontSize: 16,
                        letterSpacing: 0.5,
                        textTransform: "none",
                      }}
                    >
                      {s.val}
                    </span>
                  </label>
                  <input
                    type="range"
                    className="viz-slider"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.value}
                    onChange={(e) => s.set(+e.target.value)}
                  />
                </div>
              ))}

              <div
                style={{
                  marginTop: 18,
                  padding: "14px 16px",
                  background: C.bgDeep,
                  borderRadius: 8,
                  borderLeft: `4px solid ${zoneColor}`,
                  transition: "border-left-color 0.25s ease",
                }}
              >
                <div
                  style={{
                    color: C.muted,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  Current zone
                </div>
                <div
                  style={{
                    color: C.white,
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Trebuchet MS,sans-serif",
                    marginTop: 4,
                  }}
                >
                  {zoneName}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontSize: 12,
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {zoneDesc}
                </div>
              </div>
            </div>

            <VaultGauge vaultUsd={vaultUsd} firePool={firePool} iceL={iceOut} />

            <div>
              <div
                className="viz-results-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 12,
                }}
              >
                {(
                  [
                    {
                      accent: C.btc,
                      lbl: "Vault value",
                      num: fmtUsd(vaultUsd),
                      numColor: C.btc,
                      sub: `${vault % 1 === 0 ? vault : vault.toFixed(1)} BTC × $${price.toLocaleString()}`,
                    },
                    {
                      accent: C.charms,
                      lbl: "Reserve ratio",
                      num: isFinite(ratio) ? ratio.toFixed(2) + "×" : "∞",
                      numColor: C.white,
                      sub: "Vault ÷ ICE liability",
                    },
                    {
                      accent: C.charms,
                      lbl: "FIRE pool (USD)",
                      num: firePool >= 0 ? fmtUsd(firePool) : "-",
                      numColor: C.white,
                      sub: "Vault value beyond ICE liability",
                    },
                    {
                      accent: C.fire,
                      lbl: "FIRE per token",
                      num: firePer >= 0 ? `$${fmt2(firePer)}` : "-",
                      numColor: C.fire,
                      sub:
                        firePer >= 0
                          ? `${fmtUsd(firePool)} pool ÷ ${fmtTokens(fireOut)}`
                          : "Vault below ICE liability - FIRE wiped",
                    },
                  ] as {
                    accent: string;
                    lbl: string;
                    num: string;
                    numColor: string;
                    sub: string;
                  }[]
                ).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.bgDeep,
                      border: `1px solid ${C.cardEdge}`,
                      borderLeft: `3px solid ${r.accent}`,
                      borderRadius: 8,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        color: C.muted,
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                      }}
                    >
                      {r.lbl}
                    </div>
                    <div
                      style={{
                        color: r.numColor,
                        fontSize: 28,
                        fontWeight: "bold",
                        marginTop: 6,
                        fontFamily: "Trebuchet MS,sans-serif",
                        letterSpacing: 0.5,
                      }}
                    >
                      {r.num}
                    </div>
                    <div style={{ color: C.dim, fontSize: 11, marginTop: 4 }}>
                      {r.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 18,
                  background: C.bgDeep,
                  borderRadius: 8,
                  border: `1px solid ${C.cardEdge}`,
                }}
              >
                <div
                  style={{
                    color: C.muted,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 10,
                  }}
                >
                  Capital stack (proportions)
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 46,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  {icePct !== null && firePct !== null ? (
                    <>
                      <div
                        style={{
                          width: `${icePct}%`,
                          background: C.ice,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 14px",
                          color: C.bgDeep,
                          fontWeight: "bold",
                          fontFamily: "Trebuchet MS,sans-serif",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          transition: "width 0.25s ease",
                        }}
                      >
                        ICE {Math.round(icePct)}%
                      </div>
                      <div
                        style={{
                          width: `${firePct}%`,
                          background: C.fire,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 14px",
                          color: C.bgDeep,
                          fontWeight: "bold",
                          fontFamily: "Trebuchet MS,sans-serif",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          transition: "width 0.25s ease",
                        }}
                      >
                        FIRE {Math.round(firePct)}%
                      </div>
                    </>
                  ) : firePool <= 0 && iceOut > 0 ? (
                    <div
                      style={{
                        width: "100%",
                        background: "#4A1A1A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.frozen,
                        fontWeight: "bold",
                        fontFamily: "Trebuchet MS,sans-serif",
                        fontSize: 13,
                      }}
                    >
                      Vault under ICE liability - FIRE underwater
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        background: C.fire,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.bgDeep,
                        fontWeight: "bold",
                        fontFamily: "Trebuchet MS,sans-serif",
                        fontSize: 13,
                      }}
                    >
                      FIRE 100% (no ICE issued)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thermometer */}
        <div className="viz-sec" style={sec}>
          <div style={eyebrow}>The Strength of the Magic</div>
          <h2 className="viz-h2" style={h2s}>
            Three thresholds govern what&apos;s possible.
          </h2>
          <div style={lede}>
            As the reserve ratio crosses each line, the protocol shifts
            what&apos;s allowed.
          </div>

          <div
            style={{
              marginTop: 24,
              padding: "20px 22px 18px",
              background: C.bgDeep,
              borderRadius: 8,
              border: `1px solid ${C.cardEdge}`,
            }}
          >
            <div style={{ position: "relative", height: 52, marginTop: 36 }}>
              <div
                style={{
                  display: "flex",
                  height: 52,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {[
                  { lines: ["< 2×", "Locked"], bg: "#8A4A1A" },
                  { lines: ["2× – 4×", "Buffer"], bg: "#8A6A1A" },
                  { lines: ["> 4×", "Healthy"], bg: "#1F6B3A" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      flex: "0 0 33.333%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: s.bg,
                      color: C.white,
                      fontSize: 12,
                      fontWeight: "bold",
                      textAlign: "center",
                      lineHeight: 1.2,
                      padding: "0 6px",
                      fontFamily: "Trebuchet MS,sans-serif",
                    }}
                  >
                    <span>{s.lines[0]}</span>
                    <span style={{ opacity: 0.85 }}>{s.lines[1]}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  bottom: -10,
                  width: 3,
                  marginLeft: -1.5,
                  background: C.white,
                  boxShadow: "0 0 6px rgba(255,255,255,0.6)",
                  left: `${thermPct}%`,
                  transition: "left 0.25s ease",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -36,
                  background: C.white,
                  color: C.bgDeep,
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontFamily: "Trebuchet MS,sans-serif",
                  fontWeight: "bold",
                  fontSize: 13,
                  transform: "translateX(-50%)",
                  left: `${thermPct}%`,
                  transition: "left 0.25s ease",
                  whiteSpace: "nowrap",
                  zIndex: 3,
                }}
              >
                {isFinite(ratio) ? ratio.toFixed(2) + "×" : "∞"}
                <span
                  style={{
                    position: "absolute",
                    bottom: -5,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `5px solid ${C.white}`,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: C.muted,
                fontSize: 11,
                marginTop: 8,
                fontFamily: "Trebuchet MS,sans-serif",
                padding: "0 2px",
              }}
            >
              <span>0×</span>
              <span>2×</span>
              <span>4×</span>
              <span>8×+</span>
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div className="viz-sec" style={sec}>
          <div style={eyebrow}>Scenarios</div>
          <h2 className="viz-h2" style={h2s}>
            What happens when BTC moves from here.
          </h2>
          <div style={lede}>
            Holding the vault and ICE outstanding constant; only BTC&apos;s
            price changes.
          </div>

          <div
            className="viz-eq-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
              marginTop: 22,
            }}
          >
            {scenarios.map((sc) => {
              const newP = price * (1 + sc.delta);
              const newVault = vault * newP;
              const newFirePool = newVault - iceOut;
              const newFirePer = newFirePool / fireOut;
              const newRatio = iceOut > 0 ? newVault / iceOut : Infinity;
              const fireDeltaPct =
                firePer > 0 ? ((newFirePer - firePer) / firePer) * 100 : 0;
              return (
                <div
                  key={sc.label}
                  style={{
                    background: C.bgDeep,
                    border: `1px solid ${C.cardEdge}`,
                    borderRadius: 8,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Trebuchet MS,sans-serif",
                      fontWeight: "bold",
                      color: C.btc,
                      fontSize: 18,
                      marginBottom: 14,
                      paddingBottom: 10,
                      borderBottom: `1px solid ${C.cardEdge}`,
                    }}
                  >
                    {sc.label}
                  </div>
                  {(
                    [
                      {
                        lbl: "FIRE per token",
                        v: newFirePer >= 0 ? `$${fmt2(newFirePer)}` : "$0.00",
                        col: C.fire,
                      },
                      {
                        lbl: "FIRE % move",
                        v:
                          sc.delta === 0
                            ? "0%"
                            : newFirePer < 0
                              ? "−100%"
                              : fmtPct(fireDeltaPct),
                        col: C.fire,
                      },
                      {
                        lbl: "FIRE pool",
                        v: fmtUsd(Math.max(0, newFirePool)),
                        col: C.white,
                      },
                      {
                        lbl: "Reserve ratio",
                        v: isFinite(newRatio) ? newRatio.toFixed(2) + "×" : "∞",
                        col: C.white,
                      },
                    ] as { lbl: string; v: string; col: string }[]
                  ).map((row) => (
                    <div
                      key={row.lbl}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginTop: 9,
                      }}
                    >
                      <span style={{ color: C.muted, fontSize: 12 }}>
                        {row.lbl}
                      </span>
                      <span
                        style={{
                          fontFamily: "Trebuchet MS,sans-serif",
                          fontWeight: "bold",
                          fontSize: 17,
                          color: row.col,
                        }}
                      >
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </InteractiveGradientBg>
  );
}
