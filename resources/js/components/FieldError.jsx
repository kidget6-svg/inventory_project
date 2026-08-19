import React from 'react';

/**
 * FieldError – displays a single field-level validation error.
 *
 * Works with both the useValidation hook (string errors) and backend
 * Form Request responses (array of strings).
 *
 * @param {string} name         – the field name to look up
 * @param {Object} errors       – the errors object from state
 */
export const FieldError = ({ name, errors }) => {
  if (!errors || !errors[name]) return null;
  const msg = Array.isArray(errors[name]) ? errors[name][0] : errors[name];
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
};

/**
 * FieldErrorsSummary – shows a summary banner of all validation errors.
 */
export const FieldErrorsSummary = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) return null;
  const allMessages = Object.values(errors).flat();
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm mb-4">
      <ul className="list-disc list-inside space-y-0.5">
        {allMessages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default FieldError;
