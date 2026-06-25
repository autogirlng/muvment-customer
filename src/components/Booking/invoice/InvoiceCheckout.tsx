"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import { FiCheckCircle, FiClock, FiCopy, FiInfo, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
import { useInvoiceCheckout } from "./useInvoiceCheckout";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";

const BRAND = "#0673ff";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const safeFormat = (dateString: string | undefined | null, fmt: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, fmt) : "Invalid Date";
};

export default function InvoiceCheckout() {
  const pathname = usePathname();
  const router = useRouter();
  const invoiceNumber = pathname?.split("/").pop() ?? "";

  const { invoice, vehicle, isLoading, isError } =
    useInvoiceCheckout(invoiceNumber);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4"
            style={{ borderTopColor: BRAND, borderBottomColor: BRAND }}
          ></div>
          <p className="text-gray-500 animate-pulse">
            Retrieving invoice details...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <FiInfo className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Invoice Not Found
          </h3>
          <p className="text-red-500 mb-6 text-sm max-w-md">
            We couldn't retrieve the details for this invoice.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 text-white rounded-full hover:opacity-90 transition font-medium"
            style={{ backgroundColor: BRAND }}
          >
            Go back home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isConfirmed =
    invoice.bookingStatus === "CONFIRMED" ||
    invoice.bookingStatus === "SUCCESSFUL";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 mt-16">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 mb-8 text-center">
          {isConfirmed ? (
            <div className="mx-auto mb-5 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500">
              <FiCheckCircle
                className="w-11 h-11 text-white"
                strokeWidth={2.5}
              />
            </div>
          ) : (
            <div className="mx-auto mb-5 inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50">
              <FiClock className="w-11 h-11 text-amber-500" strokeWidth={2} />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isConfirmed ? "Payment Successful" : "Complete Your Payment"}
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            {isConfirmed
              ? "Your booking is confirmed. Thank you for your payment!"
              : "Please transfer the exact amount to the account details below. This page will update automatically once payment is received."}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {invoice?.dva?.amountDue != 0 &&
              invoice?.hasDva &&
              invoice?.dva && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#f8fbff]">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      Bank Transfer
                    </h3>
                    <img
                      src="/images/paymentgateway/moniepoint-seeklogo.svg"
                      alt="Moniepoint"
                      className="h-6 object-contain"
                    />
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Amount Due
                      </p>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-3xl font-extrabold"
                          style={{ color: BRAND }}
                        >
                          {formatCurrency(invoice.dva.amountDue)}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              invoice.dva.amountDue.toString(),
                              "Amount",
                            )
                          }
                          className="text-gray-400 hover:text-gray-700 transition"
                        >
                          <FiCopy size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                            Bank Name
                          </p>
                          <p className="font-bold text-gray-900">
                            {invoice.dva.bankName}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                            Account Number
                          </p>
                          <p className="font-bold text-xl tracking-widest text-gray-900">
                            {invoice.dva.accountNumber}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              invoice.dva.accountNumber,
                              "Account Number",
                            )
                          }
                          className="text-[#0673ff] hover:bg-blue-50 p-2 rounded-lg transition"
                        >
                          <FiCopy size={20} />
                        </button>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                          Account Name
                        </p>
                        <p className="font-medium text-gray-900">
                          {invoice.dva.accountName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <FiInfo className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Use this account strictly for this transaction.
                        Transfers must match the exact amount above.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-5 border-b border-gray-100 pb-4">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <FiHash size={16} /> Invoice No.
                  </span>
                  <span className="font-mono font-medium text-gray-900 text-sm bg-gray-100 px-2 py-1 rounded">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      isConfirmed
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isConfirmed ? <FiCheckCircle /> : <FiClock />}

                    {(invoice?.bookingStatus || "PENDING").replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Customer</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {invoice.booker?.fullName}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                  Vehicle Details
                </h4>
                <div className="flex items-center gap-4">
                  {vehicle?.photos?.[0]?.cloudinaryUrl ? (
                    <img
                      src={vehicle.photos[0].cloudinaryUrl}
                      alt={vehicle.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FiInfo className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">
                      {invoice.vehicle?.vehicleName ||
                        vehicle?.name ||
                        "Pending Vehicle"}
                    </p>
                    <p className="text-sm text-gray-500 font-mono mt-0.5">
                      {invoice.vehicle?.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.originalPrice)}</span>
                </div>
                {invoice.discounted && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Price</span>
                  <span
                    className="font-extrabold text-lg"
                    style={{ color: BRAND }}
                  >
                    {formatCurrency(invoice.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
