import { IconType } from "react-icons";

interface NavItemProps {
  item: { name: string; link: string; icon: IconType };
  onClick?: () => void;
  isActive: boolean;
}

export const NavItem = ({ item, onClick, isActive }: NavItemProps) => {
  const Icon = item.icon;

  return (
    <a
      href={item.link}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{item.name}</span>
    </a>
  );
};
