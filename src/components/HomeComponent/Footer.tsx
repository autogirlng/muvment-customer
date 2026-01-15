"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useNewsletter from "@/utils/useNewLetter";
import Input from "../utils/InputComponent";
import Button from "../utils/Button";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

type FooterNavProps = {
  title: string;
  links: {
    name: string;
    link?: string;
    badgeTitle?: string;
    scrollTo?: string;
    type?: string;
  }[];
};

const footerNav: FooterNavProps[] = [
  {
    title: "Company",
    links: [
      { name: "About us", link: "/" },
      { name: "Contact us", link: "/contact-us" },
      { name: "FAQs", link: "/faq" },
    ],
  },
  {
    title: "Locations",
    links: [
      { name: "Lagos", link: "/booking/search?city=lagos" },
      { name: "Abuja", link: "/booking/search?city=abuja" },
      { name: "Benin City", link: "/booking/search?city=benin" },
      { name: "Enugu", link: "/booking/search?city=enugu" },
      { name: "Port Harcourt", link: "/booking/search?city=port-harcourt" },
      { name: "Accra", link: "/booking/search?city=accra" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Get paid", link: "/" },
      { name: "Book a vehicle", link: "/explore/results" },
      { name: "Vehicle types", scrollTo: "/" },
      { name: "Find your location", scrollTo: "/explore/results" },
    ],
  },
];

interface NewsletterForm {
  email: string;
}

function Footer({ bookingTypeID }: { bookingTypeID?: string }) {
  const { addSubscriber } = useNewsletter();
  const [formData, setFormData] = useState<NewsletterForm>({ email: "" });
  const [errors, setErrors] = useState<Partial<NewsletterForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewsletterForm> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof NewsletterForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addSubscriber({ email: formData.email });
      // Reset form after successful submission
      setFormData({ email: "" });
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.email.trim() !== "" && Object.keys(errors).length === 0;

  return (
    <footer className="px-4 md:px-6 lg:px-8 mb-24 bg-white text-black">
      <div className="py-8 md:py-12 lg:py-16 px-6 md:px-10 lg:px-16 bg-[#F8F9FA] rounded-[32px] md:rounded-[48px] mx-2 md:mx-4 lg:mx-6">
        <div className="w-full max-w-[1400px] mx-auto text-grey-500 space-y-8 md:space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-8 lg:gap-12 gap-y-10">
            <div className="md:col-span-3 lg:col-span-2 space-y-6 max-w-[400px]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/image.png"
                  alt="Muvment"
                  width={250}
                  height={90}
                  className="h-auto"
                />
              </div>
              <p className="!font-normal text-base md:text-lg text-grey-600">
                Be the first to receive all the recent updates, articles, and
                valuable materials.
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  disabled={isSubmitting}
                  fluid={true}
                  className="flex-1 !rounded-full bg-white"
                />
                <Button
                  type="submit"
                  color="primary"
                  variant="filled"
                  className="!rounded-full !py-3 !px-8 h-fit whitespace-nowrap"
                  loading={isSubmitting}
                  disabled={isSubmitting || !isFormValid}
                >
                  Subscribe
                </Button>
              </form>
            </div>

            {footerNav.map((nav) => (
              <div className="space-y-6 !font-normal text-base" key={nav.title}>
                <p className="text-grey-900 font-medium">{nav.title}</p>
                <ul className="space-y-4 list-none text-grey-600">
                  {nav.links.map((navLink) => (
                    <li key={navLink.name} className="flex gap-1">
                      {navLink.scrollTo ? (
                        <button
                          onClick={() =>
                            navLink.scrollTo && handleScrollTo(navLink.scrollTo)
                          }
                          className="text-left hover:text-primary-500"
                        >
                          {navLink.name}
                        </button>
                      ) : navLink.type === "link" ? (
                        <Link
                          href={`${navLink.link}${
                            bookingTypeID && `bookingType=${bookingTypeID}`
                          }`}
                          className="hover:text-primary-500"
                        >
                          {navLink.name}
                        </Link>
                      ) : navLink.link ? (
                        <Link
                          href={`${navLink.link}`}
                          className="hover:text-primary-500"
                        >
                          {navLink.name}
                        </Link>
                      ) : (
                        <span>{navLink.name}</span>
                      )}
                      {navLink.badgeTitle && (
                        <span className="bg-primary-50 !font-medium text-nowrap text-sm 3xl:text-base text-primary-700 py-[2px] px-3 rounded-[15px]">
                          {navLink.badgeTitle}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-grey-300">
            <div className="w-full md:w-fit flex flex-col md:flex-row items-center gap-5 md:gap-8">
              <div className="w-full md:w-fit flex flex-col md:flex-row md:items-center gap-5 md:gap-8 text-sm">
                <Link
                  href="/policy/terms-conditions"
                  className="font-normal text-grey-600 hover:text-primary-500"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/policy/privacy-policy"
                  className="font-normal text-grey-600 hover:text-primary-500"
                >
                  Privacy Policy
                </Link>
              </div>
              <div className="w-full md:w-fit flex items-center justify-center gap-4 mt-5 md:mt-0 py-8 md:py-0 border-t border-grey-300 md:border-none text-grey-600">
                <Link
                  href="https://www.instagram.com/autogirlng"
                  target="_blank"
                  className="hover:text-primary-500"
                >
                  <FaInstagram />
                </Link>
                <Link
                  href="https://twitter.com/autogirlng"
                  target="_blank"
                  className="hover:text-primary-500"
                >
                  <FaTwitter />
                </Link>
                <Link
                  href="https://www.tiktok.com/@autogirl.ng"
                  target="_blank"
                  className="hover:text-primary-500"
                >
                  <FaTiktok />
                </Link>
                <Link
                  href="https://web.facebook.com/autogirlng"
                  target="_blank"
                  className="hover:text-primary-500"
                >
                  <FaFacebook />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/autogirl/"
                  target="_blank"
                  className="hover:text-primary-500"
                >
                  <FaLinkedin />
                </Link>
              </div>
            </div>
            <p className="text-sm text-grey-500 mt-5 md:mt-0">
              © <span>{currentYear}</span> Muvment. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
