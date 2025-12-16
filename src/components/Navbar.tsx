"use client";
import { useAuth } from "@/context/AuthContext";
import { guestMenuItems, menuItems } from "@/utils/MenuContent";
import { useState, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoLogOutOutline } from "react-icons/io5";
import { Avatar } from "./Avatar";
import { NavItem } from "./NavItem";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { NavbarSearchBar } from "./HomeComponent/NavbarSearchBar";
import SlidingBanner from "./Dashboard/SlidingBanner";
import { getBookingOption } from "@/context/Constarain";

interface NavbarProps {
  showSearchBar?: boolean;
  showAnnouncementBar?: boolean;
}

export const Navbar = ({
  showSearchBar = false,
  showAnnouncementBar = false,
}: NavbarProps) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link: string) => {
    router.push(link);
    setIsMenuOpen(false);
  };

  // const test = async () => {
  //   const data = await getBookingOption();
  //   // console.log(data);
  // };

  const items = user ? menuItems : guestMenuItems;
  const announcementMessages = [
    "We've moved! Autogirl.ng is now Muvment.ng | Hurry! Use MINT5OFF (5% off) or MUVMENT2025 (₦5,000 off) — all coupons expire Dec 31, 2025 at 11:45pm",
  ];
  return (
    <nav
      className={`fixed top-0 left-0 right-0  z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-md"
      }  `}
    >
      {showAnnouncementBar && (
        <SlidingBanner
          message={announcementMessages[0]}
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
            <Image
              src="/images/image.png"
              alt="Logo"
              width={180}
              height={180}
            />
          </button>

          {/* Center Search Bar - Only on desktop when showSearchBar is true */}
          {showSearchBar && (
            <div className="hidden lg:flex flex-1 justify-center mx-8">
              <NavbarSearchBar />
            </div>
          )}

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {/* <button
              onClick={() => router.push("/")}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Become a host
            </button> */}

            {/* <div className="h-6 w-px bg-gray-300" /> */}

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
              >
                <HiMenuAlt3 className="w-5 h-5 text-gray-600" />
                <Avatar user={user} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 z-9999 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
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
                    {items.map((item: any, index: number) => (
                      <NavItem
                        key={index}
                        item={item}
                        onClick={() => handleNavClick(item.link)}
                        isActive={pathname === item.link}
                      />
                    ))}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
          >
            <HiMenuAlt3 className="w-5 h-5 text-gray-600" />
            <Avatar user={user} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {user && (
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200">
                <Avatar user={user} size="w-12 h-12" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <button
                    onClick={() => handleNavClick("/account")}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Account
                  </button>
                </div>
              </div>
            )}

            {/* <button
              onClick={() => handleNavClick("/host")}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              Become a host
            </button> */}

            {items.map((item: any, index: number) => (
              <NavItem
                key={index}
                item={item}
                onClick={() => handleNavClick(item.link)}
                isActive={pathname === item.link}
              />
            ))}

            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
              >
                <IoLogOutOutline className="w-5 h-5" />
                <span className="font-medium">Log out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
