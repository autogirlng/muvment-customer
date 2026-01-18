"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import {
  FiStar,
  FiCheckCircle,
  FiArrowRight,
  FiMessageSquare,
  FiHeart,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { BookingService } from "@/controllers/booking/bookingService";
import { BiCar } from "react-icons/bi";
import { useAuth } from "@/context/AuthContext";

interface BookingDetails {
  bookingId: string;
  vehicle?: {
    id: string;
    vehicleName: string;
    licensePlate: string;
  };
  booker?: {
    fullName: string;
    email: string;
    customerPhone: string;
  };
}

const ReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const bookingId = params.id || "";
  const entityType = searchParams.get("entityType") || "Booking"

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const fetchBookingAndCheckReview = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // Check if user has already reviewed this booking
      const hasReviewed = await BookingService.checkIfUserHasReviewed(
        bookingId as string
      );

      if (hasReviewed) {
        setAlreadyReviewed(true);
        setLoading(false);
        return;
      }


      // Fetch booking details if no review exists
      const bookingRes = await getSingleData(
        `/api/v1/public/bookings/${bookingId}`
      );
      const bookingData = bookingRes?.data[0]?.data;


      if (!bookingData) {
        throw new Error("Booking data is missing or invalid.");
      }

      setBooking(bookingData);
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(err.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingAndCheckReview();
  }, [bookingId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const reviewPayload = {
        rating,
        review: comment,
        isAnonymous: !!user?.userId,
        recommend: comment || "No additional comments",
        entityId: bookingId as string,
        entityType,
        source: "WEB",
      };

      await BookingService.createReview(
        reviewPayload,
      );
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium text-sm animate-pulse">
            Loading your booking details...
          </p>
        </div>
      </div>
    );
  }

  // Already Reviewed State
  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center max-h-[90vh] overflow-y-auto p-4">
          <div className="max-w-xl w-full mt-[150px] mt-md-[100px] text-center py-6">
            {/* Friendly Icon */}
            <div className="mb-6  relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-full shadow-lg border-4 border-white">
                <FiCheckCircle className="text-green-600 w-16 h-16" />
              </div>
            </div>

            {/* Thank You Message */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              You've Already Shared Your Feedback!
            </h1>
            <p className="text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Thank you for taking the time to review this ride. Your feedback
              helps us continuously improve our service.
            </p>

            {/* Appreciation Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-md mx-auto border border-gray-100">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FiHeart className="text-red-500 w-6 h-6 fill-red-500" />
                <span className="text-gray-700 font-semibold">
                  We appreciate you!
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your honest feedback makes a real difference in helping other
                riders and improving our fleet.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("/booking/search")}
                className="group px-8 py-3.5 bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <BiCar className="w-5 h-5" />
                Book Another Ride
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.back()}
                className="px-8 py-3.5 bg-white cursor-pointer text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg border border-gray-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[90vh] p-6 text-center">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-full mb-6 shadow-lg">
            <FiAlertCircle className="text-red-500 w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Unable to Load Booking
          </h3>
          <p className="text-gray-600 mb-8 text-base max-w-md leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => router.push("/")}
            className="group px-8 py-3.5 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Go Back Home
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Success State (After Submitting Review)
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center max-h-[90vh] overflow-y-auto p-4">
          <div className="max-w-xl w-full mt-[100px]  text-center py-6">
            {/* Success Animation */}
            <div className="mb-4  relative inline-block">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-full shadow-lg border-4 border-white">
                <FiCheckCircle className="text-blue-600 w-16 h-16" />
              </div>
            </div>

            {/* Thank You Message */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Thank You!
            </h1>
            <p className="text-base text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
              Your feedback helps us improve our service. We truly appreciate
              you taking the time!
            </p>

            {/* Rating Display Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-md mx-auto border border-gray-100">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-gray-700 font-semibold">
                  Your Rating:
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-6 h-6 ${star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
              </div>
              {comment && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed text-left bg-slate-50 rounded-lg p-3 italic">
                    "{comment}"
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("/booking/search")}
                className="group px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <BiCar className="w-5 h-5" />
                Book Another Ride
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/")}
                className="px-8 py-3.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg border border-gray-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mt-8"></div>
      <Navbar />
      <div className="flex items-center justify-center max-h-[100vh] overflow-y-auto p-4">
        <div className="max-w-xl w-full py-4">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="h-[25vh]"></div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              How Was Your Ride?
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
              We'd love to hear about your experience! Your honest feedback
              helps us serve you better.
            </p>
          </div>

          {/* Review Card */}
          <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6 border border-gray-100">
            {/* Vehicle Info */}
            {booking?.vehicle && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 mb-5 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-md">
                    <BiCar className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {booking.vehicle.vehicleName}
                    </p>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">
                      {booking.vehicle.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-base mb-3 text-center">
                Rate Your Experience
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg p-1"
                  >
                    <FiStar
                      className={`w-8 h-8 transition-all ${star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                        : "text-gray-300 hover:text-gray-400"
                        }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700 bg-slate-50 rounded-lg py-2 px-4 inline-block">
                    {rating === 1 && "😞 Poor - We're sorry"}
                    {rating === 2 && "😕 Fair - We can do better"}
                    {rating === 3 && "😊 Good - Thanks!"}
                    {rating === 4 && "😃 Very Good - Great!"}
                    {rating === 5 && "🎉 Excellent - Thank you!"}
                  </p>
                </div>
              )}
            </div>

            {/* Comment Section */}
            <div className="mb-5">
              <label className="block text-gray-900 font-bold text-sm mb-2">
                Share Your Thoughts{" "}
                <span className="text-gray-400 font-normal text-xs">
                  (Optional)
                </span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder-gray-400 text-sm leading-relaxed shadow-sm"
                maxLength={500}
              />
              <p className="text-right text-xs text-gray-400 mt-1">
                {comment.length}/500
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-red-500 w-4 h-4 flex-shrink-0" />
                  <p className="text-red-700 text-xs font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={submitting || rating === 0}
              className="w-full py-3 bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 text-white rounded-lg font-bold text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
            >
              {submitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Review
                  <FiCheckCircle className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors font-semibold text-sm hover:bg-gray-50 rounded-lg"
            >
              Skip for now
            </button>
          </div>

          {/* Trust Badge */}
          <div className="text-center mt-4 text-xs text-gray-500">
            <p> Your feedback is secure and confidential</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
