import { createData } from "../connnector/app.callers";

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
  // Uses POST so a mail scanner prefetching the GET link cannot unsubscribe
  // anyone; the page only calls this on an explicit click.
  static async unsubscribeByContactId(
    contactId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const res: any = await createData(
      `${UNSUBSCRIBE_LINK_URL}/${contactId}`,
      {},
      { requireAuth: false, silent: true, skipLoader: true },
    );

    if (res?.error) {
      return { ok: false, message: res?.message };
    }

    const body = Array.isArray(res?.data) ? res.data[0] : res?.data;
    return { ok: true, message: body?.message };
  }
}
