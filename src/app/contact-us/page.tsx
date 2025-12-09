"use client";
import { Navbar } from "@/components/Navbar";
import React, { useState } from "react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  location: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    location: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Form submitted! Check console for data.");
  };

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
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Address</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                17a Ozumba Mbadiwe Avenue, Victoria Island, Lagos, Nigeria
              </p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaEnvelope className="text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Mail</h3>

              <a
                href="mailto:support@truveunit.com"
                className="text-gray-600 text-sm hover:text-blue-600 transition"
              >
                support@truveunit.com
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaPhoneAlt className="text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Call us on</h3>

              <div className="text-gray-600 text-sm space-y-1">
                <a
                  href="tel:+2349030235285"
                  className="block hover:text-blue-600 transition"
                >
                  +234 (0)903 023 5285
                </a>

                <a
                  href="tel:+234017367007"
                  className="block hover:text-blue-600 transition"
                >
                  +234 (0)017 367 007
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-sm ">
            <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-2">
              Contact Form
            </h2>
            <p className="text-gray-600 text-sm mb-8">
              No idea is too big. No question is too small. Reach out and let's
              create some movement together.
            </p>

            <div>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="flex flex-nowrap">
                  <div className="flex items-center px-2 sm:px-3 py-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 flex-shrink-0">
                    <div className="w-5 h-3 sm:w-6 sm:h-4 bg-green-600 rounded-sm mr-1 sm:mr-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                      +234
                    </span>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
