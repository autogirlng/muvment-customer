import {
  MdDashboard,
  MdExplore,
  MdPayment,
  MdFavorite,
  MdSettings,
  MdNotifications,
  MdAccountCircle,
  MdGroupAdd,
  MdBookOnline,
  MdEventAvailable,
  MdQuestionMark,
} from "react-icons/md";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

export const menuItems = [
  { name: "Dashboard", link: "/dashboard", icon: MdDashboard },
  { name: "Explore", link: "/Booking/search", icon: MdExplore },
  { name: "Payment", link: "/dashboard/payment", icon: MdPayment },
  {
    name: "My Bookings",
    link: "/dashboard/my-booking",
    icon: MdEventAvailable,
  },
  // { name: "Favorites", link: "/dashboard/favorites", icon: MdFavorite },
  {
    name: "Account",
    link: "/dashboard/account/profile",
    icon: MdAccountCircle,
  },
  // { name: "Settings", link: "/dashboard/settings", icon: MdSettings },
  {
    name: "Notifications",
    link: "/dashboard/notification",
    icon: MdNotifications,
  },
  {
    name: "Refer A Friend",
    link: "/dashboard/refer-a-friend",
    icon: MdGroupAdd,
  },
  {
    name: "FAQ",
    link: "/faq",
    icon: MdQuestionMark,
  },
];

export const guestMenuItems = [
  { name: "Sign In", link: "/auth/login", icon: FiLogIn },
  { name: "Sign Up", link: "/auth/register", icon: FiUserPlus },
];
