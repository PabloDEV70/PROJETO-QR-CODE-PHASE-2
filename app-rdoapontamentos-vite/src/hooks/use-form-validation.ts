import { useState, useCallback } from 'react';
import type { ZodType, ZodError } from 'zod';

export function useFormValidation<T>(schema: ZodType<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: unknown): data is T => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (e) {
      const zodError = e as ZodError;
      const fieldErrors: Record<string, string> = {};
      zodError.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (path) fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  }, [schema]);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validate, clearError, setErrors };
}
