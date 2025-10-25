import { FiUser } from "react-icons/fi";

interface AvatarProps {
  user: { firstName: string; lastName: string } | null;
  size?: string;
}

export const Avatar = ({ user, size = "w-8 h-8" }: AvatarProps) => {
  const getInitials = () => {
    if (!user) return null;
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div
      className={`${size} rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold`}
    >
      {user ? getInitials() : <FiUser className="w-5 h-5" />}
    </div>
  );
};
