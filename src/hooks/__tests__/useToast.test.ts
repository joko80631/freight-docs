import { renderHook } from '@testing-library/react';
import { useToast } from '../use-toast';
import { toast } from 'sonner';

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    warning: jest.fn(),
    promise: jest.fn(),
    dismiss: jest.fn(),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show success toast with default duration', () => {
    const { result } = renderHook(() => useToast());
    result.current.showSuccess('Success message');

    expect(toast.success).toHaveBeenCalledWith('Success message', {
      description: undefined,
      duration: 4000,
      action: undefined,
    });
  });

  it('should show success toast with custom options', () => {
    const { result } = renderHook(() => useToast());
    const options = {
      description: 'Custom description',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: jest.fn(),
      },
    };

    result.current.showSuccess('Success message', options);

    expect(toast.success).toHaveBeenCalledWith('Success message', options);
  });

  it('should show error toast with default duration', () => {
    const { result } = renderHook(() => useToast());
    result.current.showError('Error message');

    expect(toast.error).toHaveBeenCalledWith('Error message', {
      description: undefined,
      duration: 5000,
      action: undefined,
    });
  });

  it('should show loading toast', () => {
    const { result } = renderHook(() => useToast());
    result.current.showLoading('Loading message');

    expect(toast.loading).toHaveBeenCalledWith('Loading message', {
      description: undefined,
      action: undefined,
    });
  });

  it('should show info toast with default duration', () => {
    const { result } = renderHook(() => useToast());
    result.current.showInfo('Info message');

    expect(toast).toHaveBeenCalledWith('Info message', {
      description: undefined,
      duration: 4000,
      action: undefined,
    });
  });

  it('should show warning toast with default duration', () => {
    const { result } = renderHook(() => useToast());
    result.current.showWarning('Warning message');

    expect(toast.warning).toHaveBeenCalledWith('Warning message', {
      description: undefined,
      duration: 4000,
      action: undefined,
    });
  });

  it('should handle promise toast with success', async () => {
    const { result } = renderHook(() => useToast());
    const promise = Promise.resolve('Success');
    const options = {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error!',
      onSuccess: jest.fn(),
      onError: jest.fn(),
    };

    (toast.promise as jest.Mock).mockResolvedValueOnce('Success');

    await result.current.showPromise(promise, options);

    expect(toast.promise).toHaveBeenCalledWith(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
    expect(options.onSuccess).toHaveBeenCalledWith('Success');
    expect(options.onError).not.toHaveBeenCalled();
  });

  it('should handle promise toast with error', async () => {
    const { result } = renderHook(() => useToast());
    const error = new Error('Test error');
    const promise = Promise.reject(error);
    const options = {
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error!',
      onSuccess: jest.fn(),
      onError: jest.fn(),
    };

    (toast.promise as jest.Mock).mockRejectedValueOnce(error);

    await expect(result.current.showPromise(promise, options)).rejects.toThrow('Test error');

    expect(toast.promise).toHaveBeenCalledWith(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
    expect(options.onSuccess).not.toHaveBeenCalled();
    expect(options.onError).toHaveBeenCalledWith(error);
  });

  it('should dismiss toast', () => {
    const { result } = renderHook(() => useToast());
    result.current.dismiss('toast-id');

    expect(toast.dismiss).toHaveBeenCalledWith('toast-id');
  });
}); 