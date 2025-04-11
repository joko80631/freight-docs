import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';
import { z } from 'zod';

describe('useForm', () => {
  const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    age: z.number().min(18, 'Must be at least 18 years old'),
  });

  const defaultValues = {
    name: '',
    email: '',
    age: 0,
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual(defaultValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle field changes', () => {
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('name', 'John');
    });

    expect(result.current.values.name).toBe('John');
    expect(result.current.isDirty).toBe(true);
  });

  it('should validate on change when validateOnChange is true', () => {
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit: jest.fn(),
        validateOnChange: true,
      })
    );

    act(() => {
      result.current.handleChange('email', 'invalid-email');
    });

    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('should validate on blur when validateOnBlur is true', () => {
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit: jest.fn(),
        validateOnBlur: true,
      })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.touched.email).toBe(true);
  });

  it('should handle form submission with valid data', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'john@example.com');
      result.current.handleChange('age', 25);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('should handle form submission with invalid data', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.handleChange('name', 'J');
      result.current.handleChange('email', 'invalid-email');
      result.current.handleChange('age', 17);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({
      name: 'Name must be at least 2 characters',
      email: 'Invalid email',
      age: 'Must be at least 18 years old',
    });
  });

  it('should reset form to initial values', () => {
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'john@example.com');
      result.current.handleChange('age', 25);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(defaultValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it('should handle field-level error setting and clearing', () => {
    const { result } = renderHook(() =>
      useForm({
        schema,
        defaultValues,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.setFieldError('name', 'Custom error');
    });

    expect(result.current.errors.name).toBe('Custom error');

    act(() => {
      result.current.clearFieldError('name');
    });

    expect(result.current.errors.name).toBeUndefined();
  });
}); 