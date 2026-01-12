import { getSingleData } from "@/controllers/connnector/app.callers"
import { ReviewContent, ReviewResponsez } from "@/types/review"
import { useEffect, useState } from "react"
import { FiStar } from "react-icons/fi"
import { parseISO, format } from "date-fns"
import Modal from "@/components/general/modal"


interface ReviewsProps {
    vehicleId: string
}

const Reviews = ({ vehicleId }: ReviewsProps) => {

    const [reviewData, setReviewData] = useState<ReviewResponse[]>([])
    const [singleReview, setSingleReview] = useState<ReviewContent>();
    const [openModalId, setOpenModalId] = useState<string>("");

    const fetchReviewData = async () => {
        const data = await getSingleData(`/api/v1/rating-review/entity/${vehicleId}`);
        const reviews = data.data as ReviewResponse[]
        if (reviews) {
            setReviewData(reviews);
        }
    }

    console.log(reviewData)

    const openModal = async (review: ReviewContent) => {
        setSingleReview(review);
        setOpenModalId(review.id)
    }



    useEffect(() => {
        fetchReviewData();
    }, [])
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
        <section>
            <h2 className="text-lg text-gray-800 pb-1"> Reviews </h2>
            <div className="max-h-96 overflow-y-auto">
                {
                    reviewData.length > 0 && reviewData[0].data.content.length > 0 ? reviewData[0].data.content?.map((review) => {
                        const reviewDate = format(parseISO(review.createdAt), "MMMM d, yyyy");
                        const reviewTime = format(parseISO(review.createdAt), "h:mma")
                        return (
                            <div onClick={() => openModal(review)} key={review.id} className="bg-[#ffffff] mt-2 cursor-pointer px-5 flex flex-col gap-2 p-3 text-sm rounded-xl font-light">
                                <div className="flex flex-row justify-between">
                                    <div>
                                        <h4 className="font-medium">{review.reviewedBy.firstName} {review.reviewedBy.lastName}</h4>
                                        <span className="text-xs">{reviewDate} | {reviewTime}</span>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="line-clamp-3">{review.review}</p>
                            </div>
                        )
                    }) : <p className="text-xs font-light">No reviews yet</p>
                }



            </div>

            <Modal isOpen={!!openModalId} onClose={() => setOpenModalId("")}>
                <div className="bg-[#ffffff] cursor-pointer px-5 flex flex-col gap-2 p-3 text-sm rounded-xl font-light">
                    <div className="flex flex-row justify-between">
                        <div>
                            <h4 className="font-medium">Aisha O</h4>
                            {
                                singleReview?.createdAt && <span className="text-xs">{format(parseISO(singleReview?.createdAt || ""), "MMMM d, yyyy")} | {format(parseISO(singleReview?.createdAt || ""), "h:mma")}</span>

                            }
                        </div>
                        <StarRating rating={singleReview?.rating} />
                    </div>
                    <p>{singleReview?.review}</p>
                </div>
            </Modal>

        </section>
    )
}

export { Reviews }