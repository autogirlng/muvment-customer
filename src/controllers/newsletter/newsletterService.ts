import { createData } from "../connnector/app.callers";

const SUBSCRIBE_URL = "/api/v1/newsletter/subscribe";

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
}
