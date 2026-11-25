export function removeTrailingTitlePeriods(title) {
  return title.trim().replace(/\.+(?=[^\S\r\n]*(?:\r?\n|$))/g, '');
}
