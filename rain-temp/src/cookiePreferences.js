export const preferenceKey = 'kemsor.cookie-preferences';
export const preferenceVersion = 2;
export const preferenceLifetime = 180 * 24 * 60 * 60 * 1000;

export function parsePreferences(raw, now = Date.now()) {
 try {
  const value = JSON.parse(raw);
  if(value?.version !== preferenceVersion || typeof value.externalMedia !== 'boolean' || !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt >= preferenceLifetime) return null;
  return {version:preferenceVersion,necessary:true,externalMedia:value.externalMedia,savedAt:value.savedAt};
 } catch { return null; }
}
export function createPreferences(externalMedia, now = Date.now()) {
 return {version:preferenceVersion,necessary:true,externalMedia:externalMedia === true,savedAt:now};
}
export function readPreferences(storage, now = Date.now()) {
 try { return parsePreferences(storage.getItem(preferenceKey),now); } catch { return null; }
}
