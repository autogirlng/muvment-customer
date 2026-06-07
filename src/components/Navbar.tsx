"use client";
import { useAuth } from "@/context/AuthContext";
import { guestMenuItems, menuItems } from "@/utils/MenuContent";
import { useState, useEffect, useRef } from "react"; // Added useRef
import { createPortal } from "react-dom";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoLogOutOutline, IoClose, IoChevronForward } from "react-icons/io5";
import { Avatar } from "./Avatar";
import { NavItem } from "./NavItem";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NavbarSearchBar } from "./HomeComponent/NavbarSearchBar";
import SlidingBanner from "./Dashboard/SlidingBanner";
import { getBookingOption } from "@/context/Constarain";
import { BookingOption } from "@/types/booking";
import { getSingleData } from "@/controllers/connnector/app.callers";
import { NavbarProps, BannerContent } from "@/types/navbar";


export const Navbar = ({
  showSearchBar = false,
  showAnnouncementBar = false,
  homeHero = false,
}: NavbarProps) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bannerContent, setBannerContent] = useState<BannerContent | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Create Refs for the specific interactive elements
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [bookingTypeID, setBookingTypeID] = useState<string>();
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);

  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
    if (data.dropdownOptions?.length > 0) {
      setBookingTypeID(data.dropdownOptions[0].value);
    }
  };

  useEffect(() => {
    getBookingOptions();
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Logic to handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If menu is closed, we don't need to do anything
      if (!isMenuOpen) return;

      const target = event.target as Node;

      // Check if click is inside the Desktop Menu Wrapper
      const isInsideDesktop = desktopMenuRef.current?.contains(target);
      // Check if click is inside the Mobile Toggle Button
      const isInsideMobileButton = mobileButtonRef.current?.contains(target);
      // Check if click is inside the Mobile Menu Dropdown
      const isInsideMobileMenu = mobileMenuRef.current?.contains(target);

      // If the click is NOT inside any of our menu elements, close the menu
      if (!isInsideDesktop && !isInsideMobileButton && !isInsideMobileMenu) {
        setIsMenuOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleNavClick = (link: string) => {
    setIsMenuOpen(false);
    if (/^https?:\/\//.test(link)) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      router.push(link);
    }
  };

  const exploreLink = `/booking/search${
    bookingTypeID ? `?bookingType=${bookingTypeID}` : ""
  }`;

  const getBannerMessage = async () => {
    const banner = await getSingleData('/api/v1/banner')
    setBannerContent(banner.data[0].data.content[0]);
  }


  useEffect(() => {
    if (showAnnouncementBar) {
      getBannerMessage();
    }
  }, [showAnnouncementBar]);

  // Search lives in the nav on every page except the home hero at the top,
  // where the hero already carries the search; it reveals on scroll there.
  const showNavSearch = homeHero ? isScrolled || showSearchBar : true;

  const items = user ? menuItems : guestMenuItems;
  const navListItems = items.filter(
    (i: any) => i.name !== "Sign In" && i.name !== "Sign Up",
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0  z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-md"
        }  `}
    >
      {showAnnouncementBar && bannerContent && bannerContent.description && (
        <SlidingBanner
          message={bannerContent.description}
          backgroundColor="bg-gradient-to-r from-violet-600 to-indigo-600"
          textColor="text-white"
          duration={30}
        />
      )}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Image src="/images/image.png" alt="Muvment" width={180} height={180} />
          </button>

          {/* Center search - on every page except the home hero (reveals on scroll) */}
          {showNavSearch && (
            <div className="hidden lg:flex flex-1 justify-center px-8">
              <NavbarSearchBar />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3 lg:gap-4">
            {!showNavSearch && (
              <Link
                href={exploreLink}
                className="hidden lg:inline-flex items-center bg-[#0673FF] text-white px-5 py-2.5 rounded-full text-[15px] font-semibold hover:bg-[#0560d6] transition-colors"
              >
                Book a ride
              </Link>
            )}

            {/* Menu trigger */}
            <div className="relative" ref={desktopMenuRef}>
              <button
                ref={mobileButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
              >
                <HiMenuAlt3 className="w-5 h-5 text-gray-600" />
                <Avatar user={user} />
              </button>

              {/* Desktop dropdown */}
              {isMenuOpen && (
                <div className="hidden lg:block absolute right-0 z-[9999] mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="w-12 h-12" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <button
                            onClick={() =>
                              handleNavClick("/dashboard/account/profile")
                            }
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="py-2">
                    {items.map((item: any, index: number) => {
                      if (item.name === "Explore") {
                        item.link = exploreLink;
                      }
                      return (
                        <NavItem
                          key={index}
                          item={item}
                          onClick={() => handleNavClick(item.link)}
                          isActive={pathname === item.link}
                        />
                      );
                    })}
                  </div>

                  {user && (
                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <IoLogOutOutline className="w-5 h-5" />
                        <span className="font-medium">Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu (portaled to body to escape the nav's backdrop-filter) */}
      {mounted &&
        isMenuOpen &&
        createPortal(
          <div
            ref={mobileMenuRef}
            className="lg:hidden fixed inset-0 z-[60] bg-white flex flex-col"
          >
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-gray-100">
            <button
              onClick={() => handleNavClick("/")}
              className="flex-shrink-0"
              aria-label="Muvment home"
            >
              <Image
                src="/images/image.png"
                alt="Muvment"
                width={150}
                height={150}
              />
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <IoClose className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Account header (logged in) */}
          {user && (
            <button
              onClick={() => handleNavClick("/dashboard/account/profile")}
              className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 text-left"
            >
              <Avatar user={user} size="w-11 h-11" />
              <div>
                <p className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-sm text-[#0673FF]">View account</span>
              </div>
            </button>
          )}

          {/* Links */}
          <nav className="flex-1 overflow-y-auto px-5">
            {navListItems.map((item: any, index: number) => {
              if (item.name === "Explore") {
                item.link = exploreLink;
              }
              return (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.link)}
                  className="w-full flex items-center justify-between py-5 border-b border-gray-100 text-left"
                >
                  <span className="text-[17px] font-medium text-gray-900">
                    {item.name}
                  </span>
                  <IoChevronForward className="w-5 h-5 text-gray-400" />
                </button>
              );
            })}
          </nav>

          {/* Pinned actions */}
          <div
            className="p-4 border-t border-gray-100"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {user ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleNavClick(exploreLink)}
                  className="w-full py-3.5 rounded-full bg-[#0673FF] text-white font-semibold text-[15px] hover:bg-[#0560d6] transition-colors"
                >
                  Book a ride
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3.5 rounded-full border border-gray-300 text-red-600 font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <IoLogOutOutline className="w-5 h-5" />
                  Log out
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNavClick("/auth/login")}
                    className="py-3.5 rounded-full border border-gray-300 text-gray-900 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => handleNavClick(exploreLink)}
                    className="py-3.5 rounded-full bg-[#0673FF] text-white font-semibold text-[15px] hover:bg-[#0560d6] transition-colors"
                  >
                    Book a ride
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">
                  New to Muvment?{" "}
                  <button
                    onClick={() => handleNavClick("/auth/register")}
                    className="text-[#0673FF] font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
          </div>
        </div>,
          document.body,
        )}
    </nav>
  );
};