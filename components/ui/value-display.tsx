import { CurrencyCode } from "@/hooks/dashboard/prices";
import usePrices from "@/hooks/dashboard/prices";
export default function ValueDisplay({
  value,
  currency,
  className,
}: {
  value: number;
  currency: CurrencyCode;
  className?: string;
}) {
  const { convert } = usePrices();

  return (
    <span className={className}>
      {currency === "USD"
        ? `$${value.toFixed(2)}`
        : `${value} ${currency} ($${convert(value, currency, "USD").toFixed(
            2
          )})`}
    </span>
  );
}
