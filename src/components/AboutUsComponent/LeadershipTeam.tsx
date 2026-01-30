"use client";
import React from "react";
import { FaLinkedin } from "react-icons/fa";

const LeadershipTeam = () => {
  const team = [
    {
      name: "Chinazom Arinze",
      role: "CEO & Co-Founder",
      image: "/images/image9.png",
      linkedin:
        "https://www.linkedin.com/in/chinazom-arinze?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app%20%20CEO",
    },
    {
      name: "Ebuka Arinze",
      role: "COO & Co-Founder",
      image: "/images/image10.png",
      linkedin:
        "https://www.linkedin.com/in/ebukaarinze1?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    },
    {
      name: "Nyquist Nwaukwa",
      role: "Head of Engineering",
      image: "/images/image11.png",
      linkedin:
        "https://www.linkedin.com/in/nyquistjnr?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app%20%20HOE",
    },
    {
      name: "Uche Ukono",
      role: "COO",
      image: "/images/image12.png",
      linkedin:
        "https://www.linkedin.com/in/ucheukonujnr?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    },
    {
      name: "Tomisin Osibote",
      role: "Head of Marketing",
      image: "/images/image13.png",
      linkedin:
        "https://www.linkedin.com/in/oluwatomisin-osibote-320595223?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    },
    {
      name: "Omole Samuel",
      role: "Driver Manager",
      image: "/images/image14.png",
      linkedin: "https://ng.linkedin.com/in/samuel-omole-307a03268",
    },
    {
      name: "Esther Oghenekevwe Mukoro",
      role: "Host Manager",
      image: "/images/image15.png",
      linkedin: "https://www.linkedin.com/in/esther-mukoro",
    },
    {
      name: "Moyemi Suleiman",
      role: "Head of Finance",
      image: "/images/image16.png",
      linkedin: "https://www.linkedin.com/in/moyemi-suleiman",
    },
  ];

  return (
    <div className="bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-500 text-[20px] font-medium mb-3 tracking-wide">
            Leadership
          </p>
          <h2 className="text-[#2c3e50] text-[28px] md:text-[36px] font-bold mb-4">
            The Team Behind the Movement
          </h2>
          <p className="text-gray-600 text-[15px]">
            Over 70 staff building Africa's mobility future.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {team.map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Profile Image */}
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-gray-200">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold">${member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}</div>`;
                    }
                  }}
                />
              </div>

              {/* Name */}
              <h3 className="text-[#2c3e50] text-[16px] font-bold mb-1">
                {member.name}
              </h3>

              {/* Role */}
              <p className="text-gray-600 text-[13px] mb-3">{member.role}</p>

              {/* LinkedIn Connect Button */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#0077B5] text-[13px] font-medium hover:underline"
              >
                <FaLinkedin className="w-4 h-4" />
                Connect
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadershipTeam;
