// Ethiopian phone number helpers (Ethiopia country code: +251)

export const ETHIOPIA_COUNTRY_CODE = '+251';
export const PHONE_MAX_DIGITS = 10;

// Extract the local (national) digits from any stored phone value.
// Accepts "+251 911 234 567", "+251911234567", "0911234567", "911234567", etc.
export function extractPhoneDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.replace(/^251/, '');
}

// Normalize to the canonical "+251xxxxxxxxx" format (empty string when no digits).
export function normalizePhone(value) {
  const digits = extractPhoneDigits(value).slice(0, PHONE_MAX_DIGITS);
  return digits ? ETHIOPIA_COUNTRY_CODE + digits : '';
}