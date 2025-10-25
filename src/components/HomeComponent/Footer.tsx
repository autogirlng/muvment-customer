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
  }[];
};

const footerNav: FooterNavProps[] = [
  {
    title: "Company",
    links: [
      { name: "About us", link: "/" },
      { name: "Contact us", link: "/" },
      { name: "FAQs", scrollTo: "faq" },
    ],
  },
  {
    title: "Locations",
    links: [
      { name: "Lagos", link: "/explore/cities/lagos" },
      { name: "Abuja", link: "/explore/cities/abuja" },
      { name: "Benin City", link: "/explore/cities/benin" },
      { name: "Enugu", link: "/explore/cities/enugu" },
      { name: "Port Harcourt", link: "/explore/cities/port-harcourt" },
      { name: "Accra", link: "/explore/cities/accra" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Get paid", link: "https://host.muvment.ng/" },
      { name: "Book a vehicle", link: "/explore/results" },
      { name: "Vehicle types", scrollTo: "vehicle-categories" },
      { name: "Find your location", scrollTo: "popular-cities" },
    ],
  },
];

interface NewsletterForm {
  email: string;
}

function Footer() {
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
    <footer className="px-2 bg-white text-black">
      <div className="py-8 md:py-20 px-6 md:px-[60px] lg:px-[100px] 3xl:px-[143px] ">
        <div className="w-full max-w-[1553px] mx-auto text-grey-500 space-y-8 md:space-y-20">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-8 3xl:gap-10 gap-y-10">
            <div className="md:col-span-3 lg:col-span-2 space-y-10 max-w-[471px]">
              <Image src="/Images/image.png" alt="" width={438} height={45} />
              <p className="!font-normal text-xl 3xl:text-h6">
                Be the first to receive all the recent updates, articles, and
                valuable materials.
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col md:flex-row gap-[10px]"
              >
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  disabled={isSubmitting}
                  fluid={true}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  color="primary"
                  variant="filled"
                  className="!rounded-[18px] !py-4 !px-[28px] h-fit"
                  loading={isSubmitting}
                  disabled={isSubmitting || !isFormValid}
                >
                  Subscribe
                </Button>
              </form>
            </div>

            {footerNav.map((nav) => (
              <div
                className="space-y-[30px] !font-normal text-xl 3xl:text-h6"
                key={nav.title}
              >
                <p className="text-grey-400">{nav.title}</p>
                <ul className="space-y-5 list-none">
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
                      ) : navLink.link ? (
                        <Link
                          href={navLink.link}
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

          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-grey-200">
            <div className="w-full md:w-fit flex flex-col md:flex-row items-center gap-5 md:gap-10">
              <div className="w-full md:w-fit flex flex-col md:flex-row md:items-center gap-5 md:gap-10 text-xl md:text-base">
                <Link
                  href="/terms-of-service"
                  className="font-medium hover:text-primary-500"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy-policy"
                  className="font-medium hover:text-primary-500"
                >
                  Privacy Policy
                </Link>
              </div>
              <div className="w-full md:w-fit flex items-center justify-center gap-5 mt-5 md:mt-0 py-10 md:py-0 border-t border-grey-200 md:border-none">
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
            <p className="text-sm md:text-base text-grey-400 ">
              © <span>{currentYear}</span> Muvment. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
