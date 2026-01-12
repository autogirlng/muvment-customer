
export enum STATUS {
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export interface BaseResponse {
    message: string;
    status: STATUS;
    timestamp: string;
}