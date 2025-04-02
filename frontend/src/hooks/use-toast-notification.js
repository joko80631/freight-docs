import { useToast } from "@/components/ui/use-toast";

export function useToastNotification() {
  const { toast } = useToast();

  const showSuccess = (title, description) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const showError = (title, description) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showLoading = (title, description) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
  };
} 