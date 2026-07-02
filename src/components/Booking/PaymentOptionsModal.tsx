"use client";

import { useState } from "react";
import { FiCheckCircle, FiCircle, FiX } from "react-icons/fi";
import { createData } from "@/controllers/connnector/app.callers";
import { toast } from "react-toastify";

type Gateway = "PAYSTACK" | "MONNIFY";

const ngn = (amount?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount || 0);

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount?: number;
}

export default function PaymentOptionsModal({
  isOpen,
  onClose,
  bookingId,
  amount,
}: PaymentOptionsModalProps) {
  const [gateway, setGateway] = useState<Gateway>("PAYSTACK");
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const pay = async () => {
    if (!bookingId) return;
    setProcessing(true);
    try {
      let authUrl = "";
      if (gateway === "MONNIFY") {
        const res: any = await createData(
          "/api/v1/payments/initiate",
          { bookingId },
          { silent: true },
        );
        if (res?.error) {
          toast.error("We couldn't start the payment. Please try again.");
          setProcessing(false);
          return;
        }
        authUrl = res?.data?.data?.authorizationUrl;
      } else {
        const res: any = await createData(
          `/api/v1/payments/initialize/${bookingId}`,
          {},
          { silent: true },
        );
        if (res?.error) {
          toast.error("We couldn't start the payment. Please try again.");
          setProcessing(false);
          return;
        }
        authUrl = res?.data?.data;
      }
      if (!authUrl) {
        toast.error("We couldn't start the payment. Please try again.");
        setProcessing(false);
        return;
      }
      window.location.href = authUrl;
    } catch {
      toast.error("We couldn't start the payment. Please try again.");
      setProcessing(false);
    }
  };

  const Option = ({
    value,
    img,
    alt,
  }: {
    value: Gateway;
    img: string;
    alt: string;
  }) => (
    <div
      onClick={() => setGateway(value)}
      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
        gateway === value
          ? "border-[#0673ff] bg-blue-50/50"
          : "border-gray-100 bg-white hover:border-blue-200"
      }`}
    >
      <img src={img} alt={alt} className="h-8 w-auto object-contain" />
      {gateway === value ? (
        <FiCheckCircle className="text-[#0673ff] min-w-[24px]" size={24} />
      ) : (
        <FiCircle className="text-gray-300 min-w-[24px]" size={24} />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Complete payment
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {amount ? (
            <p className="mb-4 text-sm text-gray-600">
              Amount due:{" "}
              <span className="font-semibold text-gray-900">{ngn(amount)}</span>
            </p>
          ) : null}

          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Select payment method
          </h3>
          <div className="flex flex-col gap-3">
            <Option
              value="PAYSTACK"
              img="/images/paymentgateway/paystack1.svg"
              alt="Paystack"
            />
            <Option
              value="MONNIFY"
              img="/images/paymentgateway/monnify.svg"
              alt="Monnify"
            />
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
            By making this payment you agree to the Muvment platform&apos;s{" "}
            <a
              href="/policy/terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0673ff] hover:underline"
            >
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a
              href="/policy/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0673ff] hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
          <button
            onClick={onClose}
            disabled={processing}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={pay}
            disabled={processing}
            className="rounded-full bg-[#0673ff] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {processing ? "Starting payment..." : "Complete payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
