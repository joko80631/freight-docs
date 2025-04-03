import { getErrorMessage } from '@/lib/errors';

toast({
  title: 'Error',
  description: getErrorMessage(error),
  variant: 'destructive',
}); 