export function getInitials(fullName, email) {
  const words = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length > 1) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return email?.trim().charAt(0).toUpperCase() ?? "";
}
