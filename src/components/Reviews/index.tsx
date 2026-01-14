import { getSingleData } from "@/controllers/connnector/app.callers"
import { ReviewContent, ReviewResponse } from "@/types/review"
import { useEffect, useRef, useState } from "react"
import { FiStar } from "react-icons/fi"
import { parseISO, format } from "date-fns"
import Modal from "@/components/general/modal"
import { BiChevronLeft, BiChevronRight } from "react-icons/bi"
import Link from "next/link"


interface ReviewsProps {
    vehicleId: string;
    pageType?: string;
}

const Reviews = ({ vehicleId, pageType }: ReviewsProps) => {

    const [reviewData, setReviewData] = useState<ReviewResponse[]>([])
    const [singleReview, setSingleReview] = useState<ReviewContent>();
    const [openModalId, setOpenModalId] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pages, setPages] = useState<number>(1)

    const fetchReviewData = async () => {
        const data = await getSingleData(`/api/v1/rating-review/entity/${vehicleId}?page=${currentPage ?? 0}&size=${10}`);
        const reviews = data?.data as ReviewResponse[]
        if (reviews) {
            setReviewData(reviews);
            setPages(reviews[0]?.data?.totalPages ?? 1)
        }
    }



    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, pages));
    };

    const goToPrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const openModal = async (review: ReviewContent) => {
        setSingleReview(review);
        setOpenModalId(review.id)
    }



    useEffect(() => {
        fetchReviewData();
    }, [currentPage])

    const StarRating = ({ rating = 0, max = 5 }) => {
        return (
            <div className="flex gap-1">
                {Array.from({ length: max }).map((_, index) => {
                    const starNumber = index + 1;

                    let fillPercentage = 0;

                    if (rating >= starNumber) {
                        fillPercentage = 100;
                    } else if (rating >= starNumber - 0.5) {
                        fillPercentage = 50;
                    }

                    return (
                        <div key={index} className="relative h-4 w-4">
                            <FiStar className="h-4 w-4 stroke-gray-400" />

                            {fillPercentage > 0 && (
                                <div
                                    className="absolute top-0 left-0 h-full overflow-hidden"
                                    style={{ width: `${fillPercentage}%` }}
                                >
                                    <FiStar className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }




    return (
        <>

            {/* Show all reviews on mount */}
            {
                reviewData?.length > 0 && reviewData[0]?.data?.content?.length > 0 ? reviewData[0]?.data?.content?.map((review) => {
                    const reviewDate = format(parseISO(review.createdAt), "MMMM d, yyyy");
                    const reviewTime = format(parseISO(review.createdAt), "h:mma")
                    return (
                        <div onClick={() => openModal(review)} key={review.id} className="bg-[#ffffff] mt-2 cursor-pointer px-5 flex flex-col gap-2 p-3 text-sm rounded-xl font-light">
                            <div className="flex flex-row justify-between">
                                <div>
                                    <h4 className="font-medium">{review?.reviewedBy?.firstName ?? "N/A"} {review?.reviewedBy?.lastName}</h4>
                                    <span className="text-xs">{reviewDate} | {reviewTime}</span>
                                </div>
                                <StarRating rating={review?.rating} />
                            </div>
                            <p className="line-clamp-3">{review?.review}</p>

                        </div>
                    )
                }) : <p className="text-xs font-light">No reviews yet</p>
            }

            {/* Show see more reviews link if number of reviews is greater or equal to 10 */}
            {reviewData[0]?.data?.content?.length >= 10 && pageType != "review" && <Link href={`/Booking/details/${vehicleId}/reviews`}>See all reviews</Link>}


            {/* Don't show bottom navigation if page is not reviews */}
            {pageType === "review" && <nav className="flex items-center justify-center space-x-2 py-4 mt-auto">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                    <BiChevronLeft size={20} />
                </button>

                <div className="flex space-x-1">
                    {[...Array(pages)].map((_, index) => {
                        const pageNumber = index;
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors
                ${currentPage === pageNumber
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                            >
                                {pageNumber + 1}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage === pages - 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                    <BiChevronRight size={20} />
                </button>
            </nav>}

            <Modal isOpen={!!openModalId} onClose={() => setOpenModalId("")}>
                <div className="bg-[#ffffff] cursor-pointer px-5 flex flex-col gap-2 p-3 text-sm rounded-xl font-light">
                    <div className="flex flex-row justify-between">
                        <div>
                            <h4 className="font-medium">{singleReview?.reviewedBy?.firstName ?? "N/A"} {singleReview?.reviewedBy?.lastName}</h4>
                            {
                                singleReview?.createdAt && <span className="text-xs">{format(parseISO(singleReview?.createdAt || ""), "MMMM d, yyyy")} | {format(parseISO(singleReview?.createdAt || ""), "h:mma")}</span>

                            }
                        </div>
                        <StarRating rating={singleReview?.rating} />
                    </div>
                    <p>{singleReview?.review}</p>
                </div>
            </Modal>

        </>
    )
}

export { Reviews }