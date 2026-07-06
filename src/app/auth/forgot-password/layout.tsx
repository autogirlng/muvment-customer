import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Forgot Password",
  description:
    "Reset your Muvment account password. Enter your email and we will send you a reset link.",
  url: "/auth/forgot-password",
  keywords: ["Muvment password reset", "Autogirl forgot password"],
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
