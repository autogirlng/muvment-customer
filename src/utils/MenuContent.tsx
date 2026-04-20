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
  MdQuestionMark,
  MdHandshake,
} from "react-icons/md";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { GiMassDriver } from "react-icons/gi";

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
    name: "Account",
    link: "/dashboard/account/profile",
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
    name: "Settings",
    link: "/dashboard/settings",
    icon: MdSettings,
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
  {
    name: "Partner With Us",
    link: "/partner-with-us",
    icon: MdHandshake,
  },
   { name: "Become a Driver", link: "https://host.muvment.ng/earn", icon: GiMassDriver },
];