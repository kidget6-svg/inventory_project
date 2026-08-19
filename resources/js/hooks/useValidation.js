import { useState, useCallback } from 'react';
import { validateField, hasErrors as _hasErrors } from '../utils/validation';

/**
 * useValidation – manages frontend form validation state.
 *
 * @param {Object} validationSchema  field -> ValidationRule(s)
 * @param {Object} initialValues    default form values
 * @returns {{
 *   values: Object,
 *   errors: Object,
 *   isValid: boolean,
 *   setValue: (field, value) => void,
 *   handleChange: (e) => void,
 *   setFieldValue: (field, value) => void,
 *   validate: () => boolean,
 *   validateField: (field, value) => string|null,
 *   clearErrors: () => void,
 *   setErrors: (errors) => void,
 * }}
 */
export const useValidation = (validationSchema = {}, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setErrorsFromBackend = useCallback((backendErrors) => {
    if (!backendErrors || typeof backendErrors !== 'object') {
      setErrors({});
      return;
    }
    const flat = {};
    for (const [field, messages] of Object.entries(backendErrors)) {
      if (Array.isArray(messages)) {
        flat[field] = messages[0];
      } else if (typeof messages === 'string') {
        flat[field] = messages;
      } else if (typeof messages === 'object') {
        flat[field] = JSON.stringify(messages);
      }
    }
    setErrors(flat);
  }, []);

  const validateSingle = useCallback(
    (field, value) => {
      if (!validationSchema[field]) return null;
      const rules = validationSchema[field];
      const ruleArray = Array.isArray(rules) ? rules : [rules];
      for (const rule of ruleArray) {
        const error = rule(value, values);
        if (error) return error;
      }
      return null;
    },
    [validationSchema, values],
  );

  const validate = useCallback(() => {
    const newErrors = {};
    for (const [field, rules] of Object.entries(validationSchema)) {
      const ruleArray = Array.isArray(rules) ? rules : [rules];
      for (const rule of ruleArray) {
        const error = rule(values[field], values);
        if (error) {
          newErrors[field] = error;
          break;
        }
      }
    }
    setErrors(newErrors);
    return _hasErrors(newErrors);
  }, [validationSchema, values]);

  const setValue = useCallback(
    (field, value) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear the field error on change
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
      // Re-validate the field with the new value
      const err = validateSingle(field, value);
      if (err) {
        setErrors((prev) => ({ ...prev, [field]: err }));
      }
    },
    [validateSingle],
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;
      setValue(name, val);
    },
    [setValue],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  const setFieldValue = useCallback(
    (field, value) => setValues((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isValid,
    setValue,
    setFieldValue,
    handleChange,
    validate,
    validateField: validateSingle,
    clearErrors,
    setErrors: setErrorsFromBackend,
  };
};

export default useValidation;
