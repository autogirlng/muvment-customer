import { toast } from "react-toastify";
import { NewsletterService } from "@/controllers/newsletter/newsletterService";

export default function useNewsletter() {
  const addSubscriber = async ({
    email,
  }: {
    email: string;
  }): Promise<boolean> => {
    const res = await NewsletterService.subscribe(email);
    if (res.ok) {
      toast.success(res.message || "You are subscribed.");
      return true;
    }
    toast.error(res.message || "Could not subscribe. Please try again.");
    return false;
  };

  return { addSubscriber };
}
