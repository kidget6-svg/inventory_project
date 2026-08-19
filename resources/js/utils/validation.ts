/**
 * Frontend validation utilities — mirror the Laravel Form Request rules.
 * These provide *immediate* user feedback; the backend (Form Requests)
 * is always the source of truth for data integrity.
 */

// ── Value helpers ───────────────────────────────────────────────

export const isFilled = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

export const isBlank = (value: string | undefined | null): boolean =>
  !value || value.trim() === '';

export const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  }
  return null;
};

// ── String / text validators ────────────────────────────────────

export const validateRequired = (value: unknown, label = 'This field'): string | null => {
  if (!isFilled(value) || (typeof value === 'string' && value.trim() === '')) {
    return `${label} is required.`;
  }
  return null;
};

export const validateLettersSpaces = (value: string, label = 'This field'): string | null => {
  if (isBlank(value)) return null; // not-required check handled separately
  const re = /^[\p{L}\s\-\'\.]+$/u;
  if (!re.test(value.trim())) {
    return `${label} may only contain letters, spaces, hyphens, apostrophes, and periods.`;
  }
  return null;
};

export const validateMaxLength = (value: string, max: number, label = 'This field'): string | null => {
  if (value && value.length > max) {
    return `${label} may not exceed ${max} characters.`;
  }
  return null;
};

export const validateNotBlank = (value: string, label = 'This field'): string | null => {
  if (value && value.trim() === '') {
    return `${label} cannot be empty or whitespace only.`;
  }
  return null;
};

// ── Email ───────────────────────────────────────────────────────

export const validateEmail = (value: string, label = 'Email'): string | null => {
  if (isBlank(value)) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) {
    return `Please enter a valid ${label.toLowerCase()}.`;
  }
  return null;
};

// ── Phone ─────────────────────────────────────────────────────

export const validatePhone = (value: string, label = 'Phone'): string | null => {
  if (isBlank(value)) return null;
  const re = /^[\+]?[0-9\s\-\(\)]+$/;
  if (!re.test(value)) {
    return `${label} may only contain digits, spaces, +, -, and parentheses.`;
  }
  if (value.replace(/\D/g, '').length < 7) {
    return `${label} number is too short.`;
  }
  return null;
};

// ── Numbers / prices / quantities ───────────────────────────────

export const validateNumber = (value: unknown, min: number | null = null, max: number | null = null, label = 'This field'): string | null => {
  if (isBlank(String(value))) return null;
  const n = toNumber(value);
  if (n === null) {
    return `${label} must be a valid number.`;
  }
  if (min !== null && n < min) {
    return `${label} must be at least ${min}.`;
  }
  if (max !== null && n > max) {
    return `${label} must not exceed ${max}.`;
  }
  return null;
};

export const validatePositiveNumber = (value: unknown, label = 'This field'): string | null => {
  if (isBlank(String(value))) return null;
  const n = toNumber(value);
  if (n === null) return `${label} must be a valid number.`;
  if (n <= 0) return `${label} must be a positive number.`;
  return null;
};

export const validateNonNegativeNumber = (value: unknown, label = 'This field'): string | null => {
  if (isBlank(String(value))) return null;
  const n = toNumber(value);
  if (n === null) return `${label} must be a valid number.`;
  if (n < 0) return `${label} cannot be negative.`;
  return null;
};

export const validateInteger = (value: unknown, label = 'This field'): string | null => {
  if (isBlank(String(value))) return null;
  const n = toNumber(value);
  if (n === null) return `${label} must be a valid number.`;
  if (!Number.isInteger(n)) return `${label} must be a whole number.`;
  return null;
};

export const validatePrice = (value: unknown, label = 'Price'): string | null => {
  if (isBlank(String(value))) return validateRequired(value, label);
  const n = toNumber(value);
  if (n === null) return `${label} must be a valid decimal number.`;
  if (n <= 0) return `${label} must be a positive value.`;
  if (n > 9999999) return `${label} value is too large.`;
  return null;
};

// ── Barcode ────────────────────────────────────────────────────

export const validateBarcode = (value: string, label = 'Barcode'): string | null => {
  if (isBlank(value)) return null;
  const re = /^[\d]{8,14}$/;
  if (!re.test(value.trim())) {
    return `${label} must be 8-14 digits.`;
  }
  return null;
};

// ── Password ───────────────────────────────────────────────────

export const validatePassword = (value: string, minLength = 8): string | null => {
  if (isBlank(value)) return 'Password is required.';
  if (value.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return null;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (isBlank(confirmation)) return 'Password confirmation is required.';
  if (password !== confirmation) {
    return 'Password confirmation does not match.';
  }
  return null;
};

// ── Role ───────────────────────────────────────────────────────

export const VALID_ROLES = ['admin', 'pharmacist', 'cashier', 'purchasing_staff'];

export const validateRole = (value: string): string | null => {
  if (isBlank(value)) return 'Please select a role.';
  if (!VALID_ROLES.includes(value)) {
    return 'The selected role is not valid.';
  }
  return null;
};

// ── Dates ──────────────────────────────────────────────────────

export const validateDate = (value: string, label = 'Date'): string | null => {
  if (isBlank(value)) return null;
  if (isNaN(Date.parse(value))) {
    return `Please enter a valid ${label.toLowerCase()}.`;
  }
  return null;
};

export const validateFutureDate = (value: string, label = 'Date'): string | null => {
  const base = validateDate(value, label);
  if (base) return base;
  if (isBlank(value)) return null;
  if (new Date(value) <= new Date()) {
    return `${label} must be in the future.`;
  }
  return null;
};

export const validatePastDate = (value: string, label = 'Date'): string | null => {
  const base = validateDate(value, label);
  if (base) return base;
  if (isBlank(value)) return null;
  if (new Date(value) >= new Date()) {
    return `${label} must be in the past.`;
  }
  return null;
};

// ── File uploads ───────────────────────────────────────────────

export const validateFile = (
  file: File | null,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg'],
  maxSizeMB: number = 2,
  label = 'File',
): string | null => {
  if (!file) return null;
  if (!allowedTypes.includes(file.type)) {
    return `${label} must be a valid file type (${allowedTypes.join(', ')}).`;
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `${label} must not exceed ${maxSizeMB} MB.`;
  }
  return null;
};

export const validateImage = (file: File | null, maxSizeMB: number = 2, label = 'Image'): string | null =>
  validateFile(file, ['image/jpeg', 'image/png', 'image/jpg'], maxSizeMB, label);

// ── Composite validators ─────────────────────────────────────────

/**
 * Build a validator from a schema object.
 * Each field maps to an array of { validate: fn, args?: [...] } entries.
 *
 * Example:
 * const errors = validateForm(schema, formData);
 */
export type ValidationRule =
  | ((value: unknown, allValues?: Record<string, unknown>) => string | null)
  | ((value: unknown, allValues?: Record<string, unknown>) => string | null)[];

export const validateField = (
  value: unknown,
  rules: ValidationRule,
  allValues?: Record<string, unknown>,
): string | null => {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  for (const rule of ruleArray) {
    const error = rule(value, allValues);
    if (error) return error;
  }
  return null;
};

export const validateForm = (
  schema: Record<string, ValidationRule>,
  values: Record<string, unknown>,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(values[field], rules, values);
    if (error) errors[field] = error;
  }
  return errors;
};

export const hasErrors = (errors: Record<string, string>): boolean =>
  Object.keys(errors).length > 0;

// ── Predefined schemas (mirror backend Form Requests) ──────────

export const userFormSchema = {
  first_name: [(v) => validateRequired(v, 'First name'), (v) => validateLettersSpaces(v, 'First name'), (v: string) => validateMaxLength(v, 255, 'First name'), (v: string) => validateNotBlank(v, 'First name')],
  last_name: [(v) => validateLettersSpaces(v, 'Last name'), (v: string) => validateMaxLength(v, 255, 'Last name'), (v: string) => validateNotBlank(v, 'Last name')],
  email: [(v) => validateRequired(v, 'Email'), (v) => validateEmail(v)],
  phone_number: [(v) => validatePhone(v, 'Phone')],
  password: [(v) => validatePassword(v, 8)],
  password_confirmation: [(v, all) => validatePasswordConfirmation((all as any).password || '', v)],
  role: [(v) => validateRole(v)],
  date_of_birth: [(v) => validatePastDate(v, 'Date of birth')],
  gender: [],
  address: [],
};

export const medicineFormSchema = {
  name: [(v) => validateRequired(v, 'Medicine name'), (v: string) => validateMaxLength(v, 255, 'Medicine name')],
  category_id: [(v) => validateRequired(v, 'Category')],
  strength: [(v) => validateRequired(v, 'Strength')],
  unit: [(v) => validateRequired(v, 'Unit')],
  price: [(v) => validatePrice(v, 'Price')],
  barcode: [(v) => validateBarcode(v, 'Barcode')],
  manufacturer: [(v) => validateRequired(v, 'Manufacturer')],
  stock: [(v) => validateRequired(v, 'Stock'), (v) => validateInteger(v, 'Stock'), (v) => validateNonNegativeNumber(v, 'Stock')],
  expiry_date: [(v) => validateRequired(v, 'Expiry date'), (v) => validateFutureDate(v, 'Expiry date')],
  is_prescription_required: [],
  shelf_location: [(v) => validateRequired(v, 'Shelf location')],
};

export const supplierFormSchema = {
  name: [(v) => validateRequired(v, 'Supplier name'), (v: string) => validateMaxLength(v, 255, 'Supplier name')],
  contact_person: [(v) => validateRequired(v, 'Contact person'), (v: string) => validateMaxLength(v, 255, 'Contact person')],
  phone: [(v) => validateRequired(v, 'Phone'), (v) => validatePhone(v, 'Phone')],
  email: [(v) => validateEmail(v, 'Email')],
  address: [(v) => validateRequired(v, 'Address')],
  // company fields etc.
};

export const categoryFormSchema = {
  name: [(v) => validateRequired(v, 'Category name'), (v: string) => validateMaxLength(v, 255, 'Category name'), (v: string) => validateNotBlank(v, 'Category name')],
  description: [],
  shelf_location: [],
};

export default {
  isFilled,
  isBlank,
  toNumber,
  validateRequired,
  validateLettersSpaces,
  validateMaxLength,
  validateNotBlank,
  validateEmail,
  validatePhone,
  validateNumber,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateInteger,
  validatePrice,
  validateBarcode,
  validatePassword,
  validatePasswordConfirmation,
  validateRole,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateFile,
  validateImage,
  validateField,
  validateForm,
  hasErrors,
  VALID_ROLES,
};
