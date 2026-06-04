export function fmtTokens(n: number) {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M tokens";
  return Math.round(n / 1_000) + "K tokens";
}

export function fmtUsd(n: number) {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1_000_000) return sign + "$" + (a / 1_000_000).toFixed(2) + "M";
  if (a >= 10_000) return sign + "$" + Math.round(a / 1_000) + "K";
  if (a >= 1_000) return sign + "$" + (a / 1_000).toFixed(1) + "K";
  return sign + "$" + a.toFixed(2);
}

export function fmt2(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtPct(n: number) {
  if (!isFinite(n)) return "—";
  return (n > 0 ? "+" : "") + n.toFixed(0) + "%";
}

export function ratioToPct(r: number) {
  if (!isFinite(r)) return 99;
  if (r <= 0) return 0;
  if (r < 1) return (r / 1) * 25;
  if (r < 2) return 25 + (r - 1) * 25;
  if (r < 4) return 50 + ((r - 2) / 2) * 25;
  return Math.min(75 + ((r - 4) / 4) * 25, 99);
}
