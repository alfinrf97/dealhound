// Small formatting helpers for DealHound: money, discounts and check times.
// One job each, no dependencies, no network.

export function usd(n) {
  const v = Number(n);
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function percentOff(deal) {
  return Math.round((1 - deal.price / deal.was) * 100);
}

export function saved(deal) {
  return deal.was - deal.price;
}

export function checkTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const time = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" });
  return `${date}, ${time} UTC`;
}

export const VERDICT_LABEL = {
  "new-low": "NEW LOW",
  strong: "STRONG PRICE",
  routine: "ROUTINE SALE",
};

export function verdictLabel(v) {
  return VERDICT_LABEL[v] ?? "CHECKED";
}
