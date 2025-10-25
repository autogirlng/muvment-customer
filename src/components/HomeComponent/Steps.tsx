"use client";
import HowItWorks from "../utils/HowItWorks";

type stepProps = {
  title: string;
  description: string;
  button?: string;
};

const steps: stepProps[] = [
  {
    title: "Choose Your Perfect Vehicle",
    description:
      "Browse our curated collection of premium vehicles. Filter by type, features, or budget to find your ideal ride for any occasion.",
  },
  {
    title: "Easy Online Booking",
    description:
      "Select your dates, choose add-ons, and complete your booking in minutes with our secure payment system. Instant confirmation guaranteed.",
    button: "Browse Vehicles",
  },
  {
    title: "Enjoy Your Journey",
    description:
      "Meet your professional driver at your chosen location and experience premium comfort throughout your trip. Sit back, relax, and enjoy the ride.",
  },
];

function Steps() {
  return <HowItWorks title="How It Works" steps={steps} />;
}

export default Steps;
