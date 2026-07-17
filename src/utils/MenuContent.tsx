import {
  MdDashboard,
  MdExplore,
  MdPayment,
  MdFavorite,
  MdSettings,
  MdNotifications,
  MdAccountCircle,
  MdGroupAdd,
  MdEventAvailable,
  MdRoute,
  MdQuestionMark,
  MdOutlineAppBlocking,
  MdInfoOutline,
  MdMailOutline,
  MdVolunteerActivism,
  MdLocationSearching,
  MdBusinessCenter,
} from "react-icons/md";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

export const menuItems = [
  { name: "Dashboard", link: "/dashboard", icon: MdDashboard },
  { name: "Explore", link: "/booking/search", icon: MdExplore },
  { name: "Payment", link: "/dashboard/payment", icon: MdPayment },
  {
    name: "My Bookings",
    link: "/dashboard/my-booking",
    icon: MdEventAvailable,
  },
  {
    name: "My Trips",
    link: "/dashboard/my-trips",
    icon: MdRoute,
  },
  {
    name: "Account",
    link: "/dashboard/settings",
    icon: MdAccountCircle,
  },
  {
    name: "Notifications",
    link: "/dashboard/notification",
    icon: MdNotifications,
  },
  { name: "Favourites", link: "/dashboard/favourites", icon: MdFavorite },
  {
    name: "Refer A Friend",
    link: "/dashboard/refer-a-friend",
    icon: MdGroupAdd,
  },
  {
    name: "Integrations",
    link: "/dashboard/integrations",
    icon: MdSettings,
  },
  {
    name: "FAQ",
    link: "/faq",
    icon: MdQuestionMark,
  },
   { name: "Our Impact", link: "/impact", icon: MdExplore },
  { name: "Blog", link: "/blog", icon:MdOutlineAppBlocking },
];

export const guestMenuItems = [
  { name: "Explore", link: "/booking/search", icon: MdExplore },
  { name: "For Business", link: "/muvment-for-business", icon: MdBusinessCenter },
  { name: "About us", link: "/about-us", icon: MdInfoOutline },
  { name: "Our Impact", link: "/impact", icon: MdVolunteerActivism },
  { name: "FAQ", link: "/faq", icon: MdQuestionMark },
  { name: "Contact us", link: "/contact-us", icon: MdMailOutline },
  { name: "Track booking", link: "/track-booking", icon: MdLocationSearching },
  { name: "Sign In", link: "/auth/login", icon: FiLogIn },
  { name: "Sign Up", link: "/auth/register", icon: FiUserPlus },
];