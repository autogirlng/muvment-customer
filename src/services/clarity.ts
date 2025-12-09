export const clarityEvent = (name: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).clarity) {
    (window as any).clarity("event", name, data || {});
  }
};

export const clarityIdentify = (userId: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).clarity) {
    (window as any).clarity("identify", userId, data || {});
  }
};
