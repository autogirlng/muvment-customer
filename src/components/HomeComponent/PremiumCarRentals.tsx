import { FaShoppingBag, FaPiggyBank, FaFlask } from "react-icons/fa";

export default function PremiumCarRental() {
  const features = [
    {
      icon: FaShoppingBag,
      title: "Wide Selection Of Vehicles",
      description:
        "Whether you need a compact car for city driving, a spacious SUV for a family trip, or a luxury car for a special occasion, Muvment has you covered.",
    },
    {
      icon: FaPiggyBank,
      title: "Affordable Pricing",
      description:
        "We offer competitive rates and transparent pricing, with no hidden fees. Enjoy the best value for your money.",
    },
    {
      icon: FaFlask,
      title: "Flexible Rental Periods",
      description:
        "Rent by the hour, day, week, or month. Whatever your needs, we have a rental plan that fits.",
    },
  ];

  return (
    <div className="min-h-screen flex item-center   bg-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-black">
          Delivering Premium Car Rental Experiences
        </h1>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
              >
                {/* Icon Container */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-black mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
