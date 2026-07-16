import { createData } from "../connnector/app.callers";
import ApiClient from "../connnector/appClient";

const SUBSCRIBE_URL = "/api/v1/newsletter/subscribe";
const UNSUBSCRIBE_LINK_URL = "/api/v1/newsletter/unsubscribe-link";

export class NewsletterService {
  static async subscribe(
    email: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const res: any = await createData(
      SUBSCRIBE_URL,
      { email },
      { requireAuth: false, silent: true, skipLoader: true },
    );

    if (res?.error) {
      return { ok: false, message: res?.message };
    }

    const body = Array.isArray(res?.data) ? res.data[0] : res?.data;
    return { ok: true, message: body?.message };
  }

  // Unsubscribes a contact by the opaque contactId carried in the email link.
  // This is a public GET the backend exposes for the unsubscribe link; the page
  // only calls it on an explicit click, so a mail scanner prefetching the link
  // cannot unsubscribe anyone on its own.
  static async unsubscribeByContactId(
    contactId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      const [data] = await ApiClient.request(
        `${UNSUBSCRIBE_LINK_URL}/${contactId}`,
        { method: "GET", requireAuth: false, silent: true },
      );

      if (data?.err) {
        return { ok: false, message: data.err };
      }
      return { ok: true, message: data?.message };
    } catch {
      return {
        ok: false,
        message: "We could not process your request. Please try again shortly.",
      };
    }
  }
}
