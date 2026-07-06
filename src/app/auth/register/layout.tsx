import { generatePageMetadata } from "@/helpers/metadata";

export const metadata = generatePageMetadata({
  title: "Create Account",
  description:
    "Join Muvment by Autogirl. Create a free account to book verified vehicles across Nigeria in minutes.",
  url: "/auth/register",
  keywords: [
    "Muvment register",
    "Create Autogirl account",
    "Sign up car rental Nigeria",
  ],
  noIndex: true,
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
