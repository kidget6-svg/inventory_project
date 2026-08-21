import React, { useState, useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';
import {
  ETHIOPIA_COUNTRY_CODE,
  PHONE_MAX_DIGITS,
  extractPhoneDigits,
  normalizePhone,
} from '../utils/phone';

// Reusable phone input for Ethiopian phone numbers.
// "+251" is always displayed as a fixed prefix and the user can only
// type the remaining digits (max PHONE_MAX_DIGITS). The value reported
// to onChange / onValueChange is the full normalized number (e.g. "+251911234567").
function rawDigits(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('251')) digits = digits.slice(3);
  return digits.slice(0, PHONE_MAX_DIGITS);
}

export default function PhoneInput({
  value,
  onChange,
  onValueChange,
  name,
  placeholder = 'Enter phone number',
  className = '',
  icon: Icon = Phone,
  iconSize = 16,
  iconClassName = 'text-gray-400',
  required = false,
  disabled = false,
}) {
  const [text, setText] = useState(() => rawDigits(value));
  const typing = useRef(false);

  useEffect(() => {
    if (typing.current) {
      typing.current = false;
      return;
    }
    setText(rawDigits(value));
  }, [value]);

  const handleChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('251')) digits = digits.slice(3);
    digits = digits.slice(0, PHONE_MAX_DIGITS);

    setText(digits);
    typing.current = true;

    const full = normalizePhone(digits);

    if (onValueChange) {
      onValueChange(full);
      return;
    }

    onChange({ ...e, target: { name, value: full } });
  };

  return (
    <div className="relative">
      {Icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={iconSize} className={iconClassName} />
        </span>
      )}
      <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">
        {ETHIOPIA_COUNTRY_CODE}
      </span>
      <input
        type="tel"
        name={name}
        inputMode="numeric"
        autoComplete="off"
        maxLength={PHONE_MAX_DIGITS}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full ${className}`}
        style={{ paddingLeft: Icon ? '5rem' : '3.5rem' }}
      />
    </div>
  );
}