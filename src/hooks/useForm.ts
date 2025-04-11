import { useCallback, useState, useEffect } from "react";
import { z } from "zod";

interface UseFormProps<T extends z.ZodType<any, any>> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

type FormErrors<T> = {
  [K in keyof T]?: string;
} & { submit?: string };

interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isDirty: boolean;
  initialValues: T;
}

export function useForm<T extends z.ZodType<any, any>>({
  schema,
  defaultValues,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormProps<T>) {
  const [state, setState] = useState<FormState<z.infer<T>>>({
    values: defaultValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
    initialValues: defaultValues,
  });

  const validate = useCallback(
    (values: z.infer<T>) => {
      try {
        schema.parse(values);
        return {} as FormErrors<z.infer<T>>;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = {} as FormErrors<z.infer<T>>;
          error.errors.forEach((curr) => {
            const path = curr.path[0] as keyof z.infer<T>;
            (errors[path] as string) = curr.message;
          });
          return errors;
        }
        return {} as FormErrors<z.infer<T>>;
      }
    },
    [schema]
  );

  const validateField = useCallback(
    (name: keyof z.infer<T>, value: any) => {
      try {
        const fieldSchema = z.object({ [name]: (schema as any).shape[name] });
        fieldSchema.parse({ [name]: value });
        return "";
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || "";
        }
        return "";
      }
    },
    [schema]
  );

  const handleChange = useCallback(
    (name: keyof z.infer<T>, value: any) => {
      setState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const newErrors = validateOnChange
          ? { ...prev.errors, [name]: validateField(name, value) }
          : prev.errors;
        const isDirty = JSON.stringify(newValues) !== JSON.stringify(prev.initialValues);

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isDirty,
        };
      });
    },
    [validateField, validateOnChange]
  );

  const handleBlur = useCallback(
    (name: keyof z.infer<T>) => {
      setState((prev) => {
        if (!validateOnBlur) return prev;

        const newErrors = {
          ...prev.errors,
          [name]: validateField(name, prev.values[name]),
        };

        return {
          ...prev,
          touched: { ...prev.touched, [name]: true },
          errors: newErrors,
        };
      });
    },
    [validateField, validateOnBlur]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      setState((prev) => ({ ...prev, isSubmitting: true }));
      
      const errors = validate(state.values);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({
          ...prev,
          errors,
          isSubmitting: false,
        }));
        return;
      }

      try {
        await onSubmit(state.values);
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          isDirty: false,
          initialValues: prev.values,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          errors: {
            ...prev.errors,
            submit: error instanceof Error ? error.message : "An error occurred",
          },
        }));
      }
    },
    [onSubmit, state.values, validate]
  );

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      values: prev.initialValues,
      errors: {},
      touched: {},
      isDirty: false,
    }));
  }, []);

  const setFieldValue = useCallback(
    (name: keyof z.infer<T>, value: any) => {
      handleChange(name, value);
    },
    [handleChange]
  );

  const setFieldError = useCallback(
    (name: keyof z.infer<T>, error: string) => {
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
      }));
    },
    []
  );

  const clearFieldError = useCallback(
    (name: keyof z.infer<T>) => {
      setState((prev) => {
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        return { ...prev, errors: newErrors };
      });
    },
    []
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isDirty: state.isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    clearFieldError,
    validate,
    validateField,
  };
} 