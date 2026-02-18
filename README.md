This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



{/* Payment Link Modal */}
{showPaymentLinkModal && generatedBookingId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Booking Created Successfully!
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Share the payment link below with the person expected to make the payment.
      </p>

      {/* Professional Payment Link Card */}
      <div className="mb-5 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <FiLink className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Payment Link</p>
            <p className="text-blue-100 text-xs">Secure • Valid for 24 hours</p>
          </div>
          <div className="ml-auto">
            <span className="bg-green-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Booking ID */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Booking ID</span>
          <span className="text-xs font-mono font-bold text-gray-800 bg-gray-200 px-2 py-1 rounded">
            #{generatedBookingId?.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Recipient */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Recipient</span>
          <span className="text-xs font-semibold text-gray-800">
            {personalInfo.recipientFullName || personalInfo.fullName}
          </span>
        </div>

        {/* Amount */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Amount Due</span>
          <span className="text-sm font-bold text-blue-600">
            {formatCurrency(priceEstimate?.totalPrice || 0)}
          </span>
        </div>

        {/* The actual link */}
        <div className="px-4 py-3 bg-white">
          <p className="text-xs text-gray-400 mb-1.5 font-medium">Payment URL</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-xs text-blue-600 truncate flex-1 font-mono">
              {`${window.location.origin}/booking/success?bookingId=${generatedBookingId}`}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/booking/success?bookingId=${generatedBookingId}`
                );
                toast.success("Link copied!");
              }}
              className="flex-shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md transition font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-blue-800 mb-2 text-xs uppercase tracking-wide">
          📋 Message Preview
        </p>
        <p className="mb-2 text-sm">
          Hi, a booking has just been generated by{" "}
          <span className="font-semibold">{personalInfo.fullName}</span> on Muvment. Please click
          the link below to proceed with your payment.
        </p>
        <p className="text-blue-600 break-all mb-2 font-mono text-xs bg-blue-100 px-2 py-1.5 rounded-md">
          {`${window.location.origin}/booking/success?bookingId=${generatedBookingId}`}
        </p>
        <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1.5">
          ⚠️ <span className="font-semibold">Please note:</span> Only payments on{" "}
          <span className="font-semibold">muvment.ng</span> are valid. Do not make any payment on
          any platform that is not Muvment, and please do not share your card details with anyone
          or any staff of Muvment for this payment.
        </p>
      </div>

      {/* Share Buttons */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Share via
        </p>
        <div className="flex gap-3">
          {/* WhatsApp */}
          <button
            onClick={() => {
              const paymentLink = `${window.location.origin}/booking/success?bookingId=${generatedBookingId}`;
              const message =
`🚗 *Muvment Booking Notification*

Hello ${personalInfo.recipientFullName || ""}, you have a pending ride booking created by *${personalInfo.fullName}*.

📋 *Booking Details*
- Booking ID: \`${generatedBookingId?.slice(0, 8).toUpperCase()}\`
- Recipient: ${personalInfo.recipientFullName || personalInfo.fullName}
- Amount Due: ${formatCurrency(priceEstimate?.totalPrice || 0)}

💳 *Payment Required*
Please complete your payment using the secure link below to confirm your ride:

👉 ${paymentLink}

⚠️ *Important Security Notice*
- Only payments made on *muvment.ng* are valid
- Do *NOT* make payment on any other platform
- Do *NOT* share your card details with anyone, including Muvment staff

_Muvment — Move with confidence_ 🌟`;
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>

          {/* Email */}
          <button
            onClick={() => {
              const paymentLink = `${window.location.origin}/booking/success?bookingId=${generatedBookingId}`;
              const subject = encodeURIComponent("🚗 Your Muvment Booking — Payment Required");
              const body = encodeURIComponent(
`Hi ${personalInfo.recipientFullName || ""},

A booking has just been generated by ${personalInfo.fullName} on Muvment.

BOOKING DETAILS
───────────────────────
Booking ID : ${generatedBookingId?.slice(0, 8).toUpperCase()}
Recipient  : ${personalInfo.recipientFullName || personalInfo.fullName}
Amount Due : ${formatCurrency(priceEstimate?.totalPrice || 0)}

PAYMENT LINK
───────────────────────
${paymentLink}

Click the link above to proceed with your secure payment and confirm your ride.

⚠️ IMPORTANT SECURITY NOTICE
- Only payments made on muvment.ng are valid
- Do NOT make payment on any other platform
- Do NOT share your card details with anyone, including Muvment staff

───────────────────────
Muvment — Move with confidence
support@muvment.ng`
              );
              window.open(
                `mailto:${personalInfo.recipientEmail || ""}?subject=${subject}&body=${body}`,
                "_blank"
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            <FiMail className="w-5 h-5" />
            Email
          </button>

          {/* Copy Message */}
          <button
            onClick={() => {
              const paymentLink = `${window.location.origin}/booking/success?bookingId=${generatedBookingId}`;
              const message =
`🚗 Muvment Booking Notification

Hello ${personalInfo.recipientFullName || ""}, a booking has been created by ${personalInfo.fullName}.

Booking ID: ${generatedBookingId?.slice(0, 8).toUpperCase()}
Amount Due: ${formatCurrency(priceEstimate?.totalPrice || 0)}

Complete your payment here:
${paymentLink}

⚠️ Only payments on muvment.ng are valid. Do not share your card details with anyone or any staff of Muvment.

Muvment — Move with confidence`;
              navigator.clipboard.writeText(message);
              toast.success("Message copied to clipboard!");
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            <FiLink className="w-5 h-5" />
            Copy
          </button>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setShowPaymentLinkModal(false);
          router.push("/");
        }}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition text-sm"
      >
        Done
      </button>
    </div>
  </div>
)}