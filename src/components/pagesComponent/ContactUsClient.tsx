"use client";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";
import BookingCTA from "@/components/general/BookingCTA";
import Reveal from "@/components/general/Reveal";
import React, { useState, FormEvent } from "react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaLinkedinIn,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { createData } from "@/controllers/connnector/app.callers";
import { toast } from "react-toastify";

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  location: string;
  message: string;
}

const emptyForm: FormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  location: "",
  message: "",
};

const socials = [
  { href: "https://www.instagram.com/autogirlng", label: "Muvment on Instagram", Icon: FaInstagram },
  { href: "https://twitter.com/autogirlng", label: "Muvment on X (Twitter)", Icon: FaTwitter },
  { href: "https://web.facebook.com/autogirlng", label: "Muvment on Facebook", Icon: FaFacebookF },
  { href: "https://wa.me/2349030235285", label: "Muvment on WhatsApp", Icon: FaWhatsapp },
  { href: "https://www.linkedin.com/company/autogirl/", label: "Muvment on LinkedIn", Icon: FaLinkedinIn },
];

const contactDetails = [
  {
    Icon: FaMapMarkerAlt,
    label: "Address",
    value: "10 Anuoluwapo Close, Opebi, Ikeja, Lagos",
    href: undefined as string | undefined,
  },
  {
    Icon: FaEnvelope,
    label: "Mail",
    value: "info@muvment.ng",
    href: "mailto:info@muvment.ng",
  },
  {
    Icon: FaPhoneAlt,
    label: "Call us on",
    value: "+234 816 747 4165",
    href: "tel:+2348167474165",
  },
];

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF]/40";

const ContactUsClient: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Enter a valid 10-digit number";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email";

    if (!formData.location.trim())
      newErrors.location = "Location is required";

    if (!formData.message.trim())
      newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  async function sendForm() {
    try {
      const response = await createData("/api/v1/contact-form", formData);

      if (response?.error === false) {
        toast.success("Form submitted successfully!");
        setFormData(emptyForm);
        setSubmitted(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    await sendForm();
    setSubmitting(false);
  }

  function startNewMessage() {
    setErrors({});
    setSubmitted(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pt-28 pb-12 sm:px-6 sm:pt-32 lg:px-8">
        {/* Hero */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0673FF] to-[#0a328f] px-7 py-12 shadow-lg sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/90">
                Contact Us
              </p>
              <h1 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-[1.1] text-white sm:text-5xl">
                We would love to{" "}
                <span className="text-orange-300">hear</span> from you
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-blue-50/90 sm:text-lg">
                Questions, feedback, or a booking you want help with? Send us a
                message and our team will get back to you.
              </p>
              <div className="mt-7 flex gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/25"
                  >
                    <Icon className="text-lg text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Body: info beside form */}
        <div className="mt-8 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          {/* Info column */}
          <div className="mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Reach us
              </p>
              <div className="mt-5 space-y-6">
                {contactDetails.map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="text-[#0673FF]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {label}
                      </h3>
                      {href ? (
                        <a
                          href={href}
                          className="mt-0.5 block break-words text-sm text-gray-600 transition-colors hover:text-[#0673FF]"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
              </Reveal>
            </div>
          </div>

          {/* Form column */}
          <Reveal>
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              {submitted ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-gray-900">
                    Message sent
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
                    Thanks for reaching out. Our team has your message and will
                    get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={startNewMessage}
                    className="mt-7 inline-flex items-center justify-center rounded-full bg-[#0673FF] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0558cc] focus:outline-none focus:ring-4 focus:ring-[#0673FF]/30"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Send us a message
                  </h2>
                  <p className="mb-8 text-sm leading-relaxed text-gray-600">
                    Tell us what you need, a booking, a question, or feedback,
                    and our team will get back to you as soon as we can.
                  </p>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:grid-cols-2 sm:gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          First name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className={`${inputBase} ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Last name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          className={`${inputBase} ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <label
                        htmlFor="phoneNumber"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <div className="flex flex-nowrap">
                        <div className="flex flex-shrink-0 items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 py-3">
                          <span className="whitespace-nowrap text-sm text-gray-700">
                            +234
                          </span>
                        </div>
                        <input
                          id="phoneNumber"
                          type="text"
                          name="phoneNumber"
                          inputMode="numeric"
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setFormData({ ...formData, phoneNumber: val });
                            setErrors({ ...errors, phoneNumber: "" });
                          }}
                          placeholder="Enter phone number"
                          className={`w-full rounded-r-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-[#0673FF]/40 ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={`${inputBase} ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <label
                        htmlFor="location"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your location"
                        className={`${inputBase} ${
                          errors.location ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.location && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div className="mb-6 sm:mb-8">
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Type your message here"
                        rows={6}
                        className={`${inputBase} resize-y ${
                          errors.message ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-[#0673FF] py-4 text-sm font-medium text-white transition-colors hover:bg-[#0558cc] focus:outline-none focus:ring-4 focus:ring-[#0673FF]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                    >
                      {submitting ? "Sending..." : "Submit"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <BookingCTA />
      <Footer />
    </div>
  );
};

export default ContactUsClient;
