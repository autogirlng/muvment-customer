import { BaseResponse } from "./base"

export interface By {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: number,
    userType: string,
    active: true
}

export interface ReviewContent {
    createdAt: string,
    updatedAt: string,
    createdById: string,
    id: string,
    rating: number,
    review: string,
    entityId: string,
    entityType: string,
    isAnonymous: boolean,
    source: string,
    status: string,
    isModerated: boolean,
    moderatedBy: By,
    moderatedAt: string,
    moderatedReason: string,

    reviewedBy: By
}

export interface ReviewResponse extends BaseResponse {
    data: {
        content: ReviewContent[],
        page: number,
        size: number,
        totalElements: number,
        totalPages: number,
        last: boolean,
        first: boolean
    },

}


