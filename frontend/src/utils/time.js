const DATE_OPTS = { timeZone: "Asia/Baku" };
const TIME_OPTS = { timeZone: "Asia/Baku", hour12: false };

function toDate(raw) {
  if (!raw) return null;
  const d = new Date(String(raw).replace(" ", "T"));
  return isNaN(d) ? null : d;
}

export function formatBakuDate(raw) {
  const d = toDate(raw);
  return d ? d.toLocaleDateString("en-CA", DATE_OPTS) : "—";
}

export function formatBakuTime(raw) {
  const d = toDate(raw);
  return d ? d.toLocaleTimeString("en-GB", TIME_OPTS) : "";
}

export function formatBakuHM(raw) {
  const d = toDate(raw);
  return d ? d.toLocaleTimeString("en-GB", { ...TIME_OPTS, second: undefined }).slice(0, 5) : "";
}

export function formatBakuDateTime(raw) {
  const d = toDate(raw);
  if (!d) return "—";
  return `${d.toLocaleDateString("en-CA", DATE_OPTS)} ${d.toLocaleTimeString("en-GB", TIME_OPTS)}`;
}
