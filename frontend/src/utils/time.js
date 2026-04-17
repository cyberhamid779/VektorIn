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

// 3 dəqiqədən əvvəl aktiv olubsa → "Aktiv"
// yoxsa → "Son görülmə: ..."
const ACTIVE_WINDOW_MS = 3 * 60 * 1000;

export function isActiveNow(raw) {
  const d = toDate(raw);
  if (!d) return false;
  return Date.now() - d.getTime() < ACTIVE_WINDOW_MS;
}

export function formatLastSeen(raw) {
  const d = toDate(raw);
  if (!d) return "Son görülmə: naməlum";

  const diff = Date.now() - d.getTime();
  if (diff < ACTIVE_WINDOW_MS) return "Aktiv";

  const min = Math.floor(diff / 60000);
  if (min < 60) return `Son görülmə: ${min} dəq əvvəl`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `Son görülmə: ${hr} saat əvvəl`;

  const day = Math.floor(hr / 24);
  if (day === 1) return `Son görülmə: dünən ${formatBakuHM(raw)}`;
  if (day < 7) return `Son görülmə: ${day} gün əvvəl`;

  return `Son görülmə: ${formatBakuDate(raw)}`;
}
