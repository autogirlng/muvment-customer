"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useNewsletter from "@/utils/useNewLetter";
import Input from "../utils/InputComponent";
import Button from "../utils/Button";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { getDefaultBookingTypeId } from "@/context/Constarain";
import { BookingOption } from "@/types/booking";
import { buildCitySearchHref } from "@/utils/cityLocations";

type FooterNavProps = {
  title: string;
  links: {
    name: string;
    link?: string;
    badgeTitle?: string;
    scrollTo?: string;
    type?: string;
    city?: string;
  }[];
};

const footerNav: FooterNavProps[] = [
  {
    title: "Company",
    links: [
      { name: "About us", link: "/about-us" },
      { name: "Impact", link: "/impact" },
      { name: "Contact us", link: "/contact-us" },
      { name: "Track booking", link: "/track-booking" },
      { name: "FAQs", link: "/faq" },
      { name: "Blog", link: "/blog" },
    ],
  },
  {
    title: "Locations",
    links: [
      { name: "Lagos", link: "/booking/search", city: "Lagos", type: "link" },
      { name: "Abuja", link: "/booking/search", city: "Abuja", type: "link" },
      {
        name: "Benin City",
        link: "/booking/search",
        city: "Benin City",
        type: "link",
      },
      { name: "Enugu", link: "/booking/search", city: "Enugu", type: "link" },
      {
        name: "Port Harcourt",
        link: "/booking/search",
        city: "Port Harcourt",
        type: "link",
      },
      { name: "Accra", link: "/booking/search", city: "Accra", type: "link" },
    ],
  },

  {
    title: "Explore",
    links: [
      { name: "Get paid", link: "https://host.muvment.ng/" },
      { name: "Become a Driver", link: "https://host.muvment.ng/earn" },
      { name: "Book a vehicle", link: "/booking/search" },
      { name: "Partner with us", link: "/partner-with-us" },
    ],
  },
];

const socials = [
  {
    Icon: FaInstagram,
    href: "https://www.instagram.com/autogirlng",
    label: "Muvment on Instagram",
  },
  {
    Icon: FaTwitter,
    href: "https://twitter.com/autogirlng",
    label: "Muvment on Twitter",
  },
  {
    Icon: FaTiktok,
    href: "https://www.tiktok.com/@autogirl.ng",
    label: "Muvment on TikTok",
  },
  {
    Icon: FaFacebook,
    href: "https://web.facebook.com/autogirlng",
    label: "Muvment on Facebook",
  },
  {
    Icon: FaLinkedin,
    href: "https://www.linkedin.com/company/autogirl/",
    label: "Muvment on LinkedIn",
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
  const [bookingType, setBookingType] = useState<string | undefined>(
    bookingTypeID,
  );
  const [_, setBookingOptions] = useState<BookingOption[]>([]);

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

  useEffect(() => {
    const getBookingOptions = async () => {
      if (!bookingTypeID) {
        const value = await getDefaultBookingTypeId();
        if (value && value !== "undefined") {
          setBookingType(value);
        }
      }
    };

    getBookingOptions();
  }, [bookingTypeID]);

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
    <footer className="bg-[#F8F9FA] text-black">
      <div className="py-14 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="w-full max-w-[1400px] mx-auto text-grey-500 space-y-10 lg:space-y-14">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 space-y-5 max-w-[360px]">
              <Image
                src="/images/image.webp"
                alt="Muvment by Autogirl"
                width={250}
                height={90}
                className="h-auto w-[170px] md:w-[180px]"
              />
              <p className="text-grey-600 text-[15px] leading-relaxed">
                Premium, reliable vehicle rentals across Nigeria and Ghana.
              </p>
              <div className="flex items-center gap-4 text-grey-600 text-[19px] pt-1">
                {socials.map(({ Icon, href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="hover:text-primary-500 transition-colors"
                  >
                    <Icon />
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {footerNav.map((nav) => (
              <div className="space-y-5 text-base" key={nav.title}>
                <p className="text-grey-900 font-bold text-[15px] tracking-wide">
                  {nav.title}
                </p>
                <ul className="space-y-3.5 list-none text-grey-600">
                  {nav.links.map((navLink) => (
                    <li key={navLink.name} className="flex gap-1">
                      {navLink.scrollTo ? (
                        <button
                          onClick={() =>
                            navLink.scrollTo && handleScrollTo(navLink.scrollTo)
                          }
                          className="text-left hover:text-primary-500 transition-colors"
                        >
                          {navLink.name}
                        </button>
                      ) : navLink.type === "link" ? (
                        <Link
                          href={
                            navLink.city
                              ? buildCitySearchHref(navLink.city)
                              : `${navLink.link}${
                                  bookingType && bookingType !== "undefined"
                                    ? `&bookingType=${bookingType}`
                                    : ""
                                }`
                          }
                          className="hover:text-primary-500 transition-colors"
                        >
                          {navLink.name}
                        </Link>
                      ) : navLink.link ? (
                        <Link
                          href={`${navLink.link}`}
                          className="hover:text-primary-500 transition-colors"
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

          {/* Bottom bar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pt-8 border-t border-grey-300 text-sm text-grey-600">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link
                href="/policy/terms-conditions"
                className="hover:text-primary-500 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/policy/privacy-policy"
                className="hover:text-primary-500 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="text-grey-500">
              © <span>{currentYear}</span> Muvment by Autogirl. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
