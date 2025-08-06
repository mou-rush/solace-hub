import { useAppStore } from "@/stores";

export function useToast() {
  const { addNotification } = useAppStore();

  const toast = {
    success: (title: string, description?: string) => {
      addNotification({ title, description, variant: "success" });
    },
    error: (title: string, description?: string) => {
      addNotification({ title, description, variant: "error" });
    },
    warning: (title: string, description?: string) => {
      addNotification({ title, description, variant: "warning" });
    },
    info: (title: string, description?: string) => {
      addNotification({ title, description, variant: "info" });
    },
  };

  return { toast };
}
