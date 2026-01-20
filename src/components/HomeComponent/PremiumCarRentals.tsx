import React from "react";
import { BsPiggyBank } from "react-icons/bs";
import { IoFileTrayFullOutline } from "react-icons/io5";
import { TbVectorSpline } from "react-icons/tb";

const CarRentalFeatures: React.FC = () => {
  const features = [
    {
      icon: <IoFileTrayFullOutline className="w-8 h-8 text-blue-500" />,
      title: "Wide Selection Of Vehicles",
      description:
        "Whether you need a compact car for city driving, a spacious SUV for a family trip, or a luxury car for a special occasion, Movment has you covered.",
    },
    {
      icon: <BsPiggyBank className="w-8 h-8  text-blue-500" />,
      title: "Affordable Pricing",
      description:
        "We offer competitive rates and transparent pricing, with no hidden fees. Enjoy the best value for your money.",
    },
    {
      icon: <TbVectorSpline className="w-8 h-8  text-blue-500" />,
      title: "Flexible Rental Periods",
      description:
        "Rent by the hour, day, week, or month. Whatever your needs, we have a rental plan that fits.",
    },
  ];

  return (
    <div className=" bg-white flex items-center justify-center p-3 ">
      <div className="max-w-7xl w-full">
        <h1 className="text-[1.2rem] md:text-[2rem] font-bold text-center mb-6 md:mb-12 py-6 text-gray-900">
          Delivering Premium Car Rental Experiences
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center  justify-center mb-6">
                {feature.icon}
              </div>

              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {feature.title}
              </h2>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarRentalFeatures;
