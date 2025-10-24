export function toISODate(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return null;
}

export function isSameISODate(value, isoDate) {
  const candidate = toISODate(value);
  if (!candidate || !isoDate) return false;
  return candidate === isoDate;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function startOfWeekISO(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  return start.toISOString().split("T")[0];
}

export function endOfWeekISO(date = new Date()) {
  const start = new Date(startOfWeekISO(date));
  start.setDate(start.getDate() + 6);
  return start.toISOString().split("T")[0];
}
