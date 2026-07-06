import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Login",
  description:
    "Sign in to your Muvment account to manage bookings, track your rides, and access your dashboard.",
  url: "/auth/login",
  keywords: [
    "Muvment login",
    "Sign in Autogirl",
    "Car rental account Nigeria",
  ],
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
