"use client";
import React from "react";
import {
  MdWifiOff,
  MdRefresh,
  MdSignalWifiStatusbarConnectedNoInternet,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NetworkErrorPage: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const onRetry = () => {
    if (navigator.onLine) {
      logout();
      router.push("/auth/login");
    } else {
      toast.info("Still no internet connection. Please check your network.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 md:p-10 text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="relative">
              <MdSignalWifiStatusbarConnectedNoInternet
                size={48}
                className="text-primary-600 animate-pulse"
              />
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <MdWifiOff size={12} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Pulsing Ring Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-primary-200 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-grey-900 mb-3">
          Connection Lost
        </h1>

        <p className="text-grey-600 text-lg mb-2 leading-relaxed">
          We're unable to connect to the internet
        </p>

        <p className="text-grey-500 text-base mb-8 leading-relaxed">
          Please check your network connection and try again. This could be due
          to Wi-Fi, mobile data, or server issues.
        </p>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-grey-75 rounded-2xl">
          <div
            className={`w-3 h-3 rounded-full ${
              navigator.onLine ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm font-medium text-grey-700">
            Status: {navigator.onLine ? "Online" : "Offline"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRetry}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <MdRefresh size={20} />
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex-1 border-2 border-grey-300 hover:border-grey-400 text-grey-700 hover:text-grey-900 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            Refresh Page
          </button>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mt-8 pt-6 border-t border-grey-200">
          <h3 className="text-sm font-semibold text-grey-700 mb-3">
            Quick Troubleshooting
          </h3>
          <ul className="text-xs text-grey-600 space-y-2">
            <li className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-grey-400 rounded-full"></div>
              Check your Wi-Fi or mobile data connection
            </li>
            <li className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-grey-400 rounded-full"></div>
              Restart your router if needed
            </li>
            <li className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-grey-400 rounded-full"></div>
              Ensure you have a stable network signal
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorPage;
