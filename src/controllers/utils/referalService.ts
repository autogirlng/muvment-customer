import {
  createData,
  deleteData,
  getSingleData,
  getTableData,
  patchData,
  updateData,
} from "../connnector/app.callers";

export class ReferralService {
  private static readonly REFERRAL_BASE_URL = "/api/v1/referrals";

  static async getAllReferrals(params?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
  }) {
    const { search, status, dateFrom, dateTo, page, size } = params || {};

    const queryParams: Record<string, any> = {
      page,
      size,
    };

    if (search) queryParams.search = search;
    if (status) queryParams.status = status;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;

    return await getTableData(this.REFERRAL_BASE_URL, queryParams);
  }

  static async getReferralById(id: string) {
    return await getSingleData(`${this.REFERRAL_BASE_URL}/${id}`);
  }

  static async getReferralCode() {
    return await getSingleData(`${this.REFERRAL_BASE_URL}/my-data`);
  }

  static async generateReferralCode() {
    return await createData(`${this.REFERRAL_BASE_URL}/generate-code`, {});
  }

  static async createReferral(formData: {
    referredEmail: string;
    referredName?: string;
    referredPhone?: string;
  }) {
    return await createData(this.REFERRAL_BASE_URL, formData);
  }

  static async updateReferral(id: string, formData: any) {
    return await updateData(this.REFERRAL_BASE_URL, id, formData);
  }

  static async deleteReferral(id: string) {
    return await deleteData(this.REFERRAL_BASE_URL, id);
  }

  static async getReferralStats() {
    return await getSingleData(`${this.REFERRAL_BASE_URL}/stats`);
  }

  static async getReferralRewards() {
    return await getSingleData(`${this.REFERRAL_BASE_URL}/rewards`);
  }

  static async searchReferrals(params?: {
    name?: string;
    email?: string;
    status?: string;
    page?: number;
    size?: number;
  }) {
    const { name, email, status, page, size } = params || {};

    const queryParams: Record<string, any> = {};

    if (name) queryParams.name = name;
    if (email) queryParams.email = email;
    if (status) queryParams.status = status;
    if (page !== undefined) queryParams.page = page;
    if (size !== undefined) queryParams.size = size;

    return await getTableData(`${this.REFERRAL_BASE_URL}/search`, queryParams);
  }

  static async updateReferralStatus(id: string, status: string) {
    return await patchData(this.REFERRAL_BASE_URL, id, "/status", { status });
  }

  static async sendReferralInvite(formData: {
    email: string;
    name?: string;
    message?: string;
  }) {
    return await createData(`${this.REFERRAL_BASE_URL}/invite`, formData);
  }

  static async getReferralHistory(params?: { page?: number; size?: number }) {
    const { page, size } = params || {};

    const queryParams: Record<string, any> = {};

    if (page !== undefined) queryParams.page = page;
    if (size !== undefined) queryParams.size = size;

    return await getTableData(`${this.REFERRAL_BASE_URL}/history`, queryParams);
  }
}
