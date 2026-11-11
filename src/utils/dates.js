export function toApiDateTime(value) {
  if (!value) return "";

  const date = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
    return `${date}:00`;
  }
  return date;
}

export function toInputDate(value) {
  return value ? String(value).slice(0, 10) : "";
}
