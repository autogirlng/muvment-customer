"use client";
import { Navbar } from "@/components/Navbar";
import React, { useState, FormEvent } from "react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaLinkedinIn,
  FaEnvelope,

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

const ContactUsClient: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    location: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }
  async function sendForm() {
    const response = await createData("/api/v1/contact-form", formData);

    if (response?.error === false) {
      toast.success("Form submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        location: "",
        message: "",
      });
    }
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;


    await sendForm();

  }

  return (
    <div className="">
      <Navbar showSearchBar={true} />
      <div className="h-[10vh]"></div>
      <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 mb-8 shadow-lg">
            <p className="text-blue-100 text-sm sm:text-base mb-3">
              Contact Us
            </p>
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              We would love to <span className="text-orange-400">hear</span>{" "}
              from you
            </h1>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/autogirlng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
              >
                <FaInstagram className="text-white text-lg" />
              </a>
              <a
                href="https://twitter.com/autogirlng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTwitter className="text-white text-lg" />
              </a>
              <a
                href="https://web.facebook.com/autogirlng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
              >
                <FaFacebookF className="text-white text-lg" />
              </a>
              <a
                href="https://wa.me/2349030235285"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
              >
                <FaWhatsapp className="text-white text-lg" />
              </a>
              <a
                href="https://www.linkedin.com/company/autogirl/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors"
              >
                <FaLinkedinIn className="text-white text-lg" />
              </a>
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {/* Address */}
            {/* <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Address</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                16 Bankole Street, Oregun, Ikeja, Lagos State, Nigeria
              </p>
            </div> */}

            {/* Email */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaEnvelope className="text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Mail</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <a
                  href="mailto:support@autogirl.ng"
                  className="block text-gray-600 text-sm hover:text-blue-600 transition"
                >
                  support@autogirl.ng
                </a>
              </div>
            </div>

            {/* Phone */}
            {/* <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaPhoneAlt className="text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Call us on</h3>

              <div className="text-gray-600 text-sm space-y-1">
                <a
                  href="tel:+ 2348167474165"
                  className="block hover:text-blue-600 transition"
                >
                  +234 (0)816 747 4165
                </a>

                <a
                  href="tel:+237049818047"
                  className="block hover:text-blue-600 transition"
                >
                  +234 (0)704 981 8047
                </a>
              </div>
            </div> */}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-sm ">
            <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-2">
              Contact Form
            </h2>
            <p className="text-gray-600 text-sm mb-8">
              No idea is too big. No question is too small. Reach out and let's
              create some <b>MUVMENT</b> together.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none
${errors.firstName ? "border-red-500" : "border-gray-200"}
focus:ring-2 focus:ring-blue-500`} />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none
${errors.lastName ? "border-red-500" : "border-gray-200"}
focus:ring-2 focus:ring-blue-500`} />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="flex flex-nowrap">
                  <div className="flex items-center px-2 sm:px-3 py-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 flex-shrink-0">
                    <span className="text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                      +234
                    </span>

                  </div>
                  <input
                    type="text" // change from number → removes arrows
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      // allow only digits and max length 10
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, phoneNumber: val });
                      setErrors({ ...errors, phoneNumber: "" }); // clear error while typing
                    }}
                    placeholder="Enter phone number"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none
${errors.phoneNumber ? "border-red-500" : "border-gray-200"}
focus:ring-2 focus:ring-blue-500`}
                  />

                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none
${errors.email ? "border-red-500" : "border-gray-200"}
focus:ring-2 focus:ring-blue-500`} />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none
${errors.location ? "border-red-500" : "border-gray-200"}
focus:ring-2 focus:ring-blue-500`} />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              <div className="mb-6 sm:mb-8">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here"
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none
${errors.message ? "border-red-500" : "border-gray-200"}
focus:ring-2 focus:ring-blue-500`} />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ContactUsClient;
