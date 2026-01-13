"use client";

import React, { useState } from "react";
import { FiX, FiStar, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  bookerName?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bookerName = "Guest",
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting");
      return;
    }

    if (comment.length > 500) {
      toast.error("Max number 500 ");
      return;
    }

    setIsSubmitting(true);
    await onSubmit(rating, comment.trim());
    setIsSubmitting(false);
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-8 pb-2 text-center border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <FiStar className="w-6 h-6 text-white" fill="white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You, {bookerName.split(" ")[0]}! 🎉
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We appreciate your booking! Your feedback helps us improve our
            services and provide better experiences for all our customers.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3 text-center">
              How would you rate your experience?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-full p-1"
                >
                  <FiStar
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-3 text-sm font-medium text-gray-700">
                {rating === 5 && "Excellent! ⭐"}
                {rating === 4 && "Great! 👍"}
                {rating === 3 && "Good 😊"}
                {rating === 2 && "Fair 🤔"}
                {rating === 1 && "Needs Improvement 😕"}
              </p>
            )}
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Share your thoughts{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">Help us serve you better</p>
              <p className="text-xs text-gray-400">{comment.length}/500</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
