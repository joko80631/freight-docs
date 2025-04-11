import { useCallback, useState } from "react";
import { z } from "zod";

interface UseFormProps<T extends z.ZodType> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export function useForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
}: UseFormProps<T>) {
  const [state, setState] = useState<FormState<z.infer<T>>>({
    values: defaultValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const validate = useCallback(
    (values: z.infer<T>) => {
      try {
        schema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors.reduce((acc, curr) => {
            const path = curr.path[0] as keyof z.infer<T>;
            acc[path] = curr.message;
            return acc;
          }, {} as Partial<Record<keyof z.infer<T>, string>>);
        }
        return {};
      }
    },
    [schema]
  );

  const handleChange = useCallback(
    (name: keyof z.infer<T>, value: any) => {
      setState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const errors = validate(newValues);
        return {
          ...prev,
          values: newValues,
          errors,
          touched: { ...prev.touched, [name]: true },
        };
      });
    },
    [validate]
  );

  const handleBlur = useCallback((name: keyof z.infer<T>) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errors = validate(state.values);
      
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({
          ...prev,
          errors,
          touched: Object.keys(state.values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          ),
        }));
        return;
      }

      setState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        await onSubmit(state.values);
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setState({
      values: defaultValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    });
  }, [defaultValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
} 