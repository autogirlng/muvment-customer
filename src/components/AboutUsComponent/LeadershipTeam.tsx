"use client";
import React from "react";
import { FaLinkedin } from "react-icons/fa";
import Reveal from "../general/Reveal";

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
  ];

  return (
    <div className="bg-[#F5F8FD] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#0673FF] text-[12px] font-semibold mb-4 tracking-[0.16em] uppercase">
            Leadership
          </p>
          <h2 className="text-gray-900 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] mb-5">
            Management team
          </h2>
          <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
            The people steering Muvment day to day, backed by a team of over 70
            across Nigeria and Ghana.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <Reveal
              key={index}
              delay={index * 80}
              className="group rounded-2xl border border-gray-200/80 bg-white p-7 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mb-5 mx-auto bg-gray-100 ring-4 ring-blue-50">
                <img
                  src={member.image}
                  alt={`${member.name}, ${member.role} at Muvment by Autogirl`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-[#0673FF] text-white text-2xl font-bold">${member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}</div>`;
                    }
                  }}
                />
              </div>

              <h3 className="text-gray-900 text-[17px] font-bold mb-1">
                {member.name}
              </h3>
              <p className="text-gray-500 text-[13px] mb-4">{member.role}</p>

              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0077B5] text-[13px] font-medium hover:underline"
              >
                <FaLinkedin className="w-4 h-4" />
                Connect
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadershipTeam;
