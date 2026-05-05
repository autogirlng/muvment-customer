import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Forgot Password",
  description:
    "Reset your Muvment account password — enter your email and we'll send you a reset link.",
  url: "/auth/forgot-password",
  keywords: ["Muvment password reset", "Autogirl forgot password"],
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
