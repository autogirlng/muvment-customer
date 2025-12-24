"use client";
import { useState, useEffect } from "react";

function TermsOfServiceClient() {
  const [activeSection, setActiveSection] = useState("general-terms");

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    { id: "general-terms", label: "General Terms" },
    { id: "general-rental", label: "General Rentals" },
    { id: "cancellation-refunds", label: "Cancellation and Refunds" },
    { id: "complimentary-ride", label: "Complimentary Ride" },
    { id: "extra-charges", label: "Extra Charges" },
    {
      id: "airport-pick-up-and-drop-off",
      label: "Airport PickUp And Drop Off",
    },
    { id: "monthly-booking", label: "Monthly Booking" },
    {
      id: "acceptance-of-terms-through-payment",
      label: "Acceptance Of Terms through Payment",
    },
    { id: "self-drive", label: "Self Drive" },
    { id: "conclusion", label: "Conclusion" },
    { id: "contact-information", label: "Contact Information" },
    {
      id: "Version-Representation",
      label: "Version & Representation of Prior Terms",
    },
  ];

  const scrollToSection = (id: any) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      const sectionElements = sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean);

      for (const section of sectionElements) {
        if (!section) continue;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId || "");
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const generalTerms = [
    "By making a payment for any of Muvment services after receiving an invoice, you agree to abide by these Terms and Conditions. It is assumed that you have read, understood, and accepted all terms herein.",
  ];

  const generalRentalItems = [
    { title: "Standard Rental hours are 12 hours." },
    {
      title:
        "You will have to pay for every extra hour spent outside your 12-hour booking period.",
    },
    {
      title:
        "You have an hour to inspect or reject a vehicle based on mechanical faults such as faulty AC.",
    },
    {
      title:
        "Accommodation should be provided for drivers for journey or 24 hours bookings.",
    },
    {
      title:
        "Our general pricing applies within central city areas. Outskirts locations attract extra charges. Outskirts locations include but not limited to Sangotedo, Badagry, Amuwo Odofin, Festac Town, Alaba, Ikorodu Town, Agbara, Agege, Epe, Free Trade Zone, Igando, Akowonjo, Dopemu, Ajah, Agbado, Ojodu Berger, Ajegunle, Ibese, Iyana Ipaja, Alimoso, Ibeju Lekki.",
    },
    {
      title:
        "We will provide 15 litres of fuel for your ride, in the event the fuel finishes during trips, you will be responsible for fueling an amount that can complete your ride.",
    },
    {
      title:
        "For travels, we only give a full tank, afterward, you will be responsible for fueling the car when the fuel finishes.",
    },
    {
      title:
        "If you know you will be extending beyond your stated time, you will have to place the request and make payment before the expiration of those 12 hours.",
    },
    {
      title:
        "The driver is allowed to leave when the time has expired after giving a call or dropping a text message notice of expiration for the client.",
    },
    {
      title:
        "For bookings that are three days or longer, please note that the chauffeur initially assigned to you may be replaced by another verified and professional chauffeur from our office. This is done to ensure your safety and well-being, as our chauffeurs are given regular rest periods to stay alert on the job. Rest assured that any replacement chauffeur will be fully qualified to provide you with the same high-quality service that you expect from us.",
    },
    {
      title:
        "If a client forgets an item behind in our rental, they are expected to notify us within a 24-hour window after which we are not liable for the missing item if it was left in our rental vehicle.",
    },
    {
      title:
        "A journey beyond Lagos is a full-day booking, and the rental period does not extend after you are back in Lagos.",
    },
    {
      title:
        "Fuel Purchase Requirement: For rentals requiring the customer to refuel/fuel the vehicle, there is a mandatory minimum fuel purchase to ensure the proper functioning and maintenance of our fuel pumps. Customers renting SUVs must purchase a minimum of ₦10,000 worth of fuel, while those renting Sedans are required to purchase at least ₦5,000 worth of fuel. This policy helps maintain the optimal operation of our vehicles and ensures that each is adequately fueled for performance and reliability.",
    },
    {
      title:
        "Customers are solely responsible for any disputes, chargebacks, or reversals of transactions, and the Company is entitled to deduct such amounts from the payment due.",
    },
  ];

  const cancellationNoticeItems = [
    {
      title: "Notice Period:",
      content: "",
      subItems: [
        "Cancellations with less than 72 hours' notice: Bookings canceled within this period will not be refunded.",
        "Cancellations with more than 72 hours' notice: 50% of the booking price will be forfeited. The remaining 50% can be refunded (processed within 24 hours of the request) or converted into booking credit for future use.",
      ],
    },
    {
      title: "Peak Period Bookings (December):",
      content:
        "Due to high demand during the festive season, all December bookings are non-cancellable and non-refundable. Please ensure you are certain of your travel dates before finalizing your booking.",
    },
    {
      title: "Faulty Vehicle Refunds:",
      content:
        "Refunds are permissible if a vehicle is found to be faulty. However, the issue must be reported to Muvment within one hour of vehicle use to qualify for a refund.",
    },
    {
      title: "Cancellation Process",
      content:
        "To cancel a booking, clients must submit a formal request via WhatsApp or by contacting our customer support team. The request must include the reason for cancellation. If the request is not properly communicated through these channels before the scheduled start time, the booking period will commence as planned.",
    },
  ];

  const complimentaryRide = [
    {
      title: "Local Area Restriction:",
      content:
        "All complimentary rides are restricted to within Lagos. Rides requested outside these geographical boundaries will incur standard charges.",
    },
    {
      title: "Additional Stops:",
      content:
        "Clients will incur charges for any stops not initially included in the agreed-upon itinerary.",
    },
    {
      title: "Extra Time Usage:",
      content:
        "If the complimentary ride exceeds the agreed timeline, additional charges for the extra time used will apply.",
    },
    {
      title: "Muvment's Discretion:",
      content:
        "Muvment reserves the right to accept or reject any proposed itinerary for complimentary rides. This decision is based on factors like route feasibility, scheduling constraints, and operational capacity.",
    },
  ];

  const extraCharges = [
    {
      title: "Late Night and Early Morning Bookings:",
      content:
        "Bookings that commence between 10:00 PM and 6:00 AM are subject to an additional fee to cover operational costs and the inconvenience associated with late-night or early-morning service. This fee will be specified at the time of booking.",
    },
    {
      title: "Extra Time Charges:",
      content:
        "Extra time charges vary by vehicle type. Higher rates apply for newer models (2021 onwards), bulletproof vehicles, buses, vintage cars, and luxury cars compared to standard vehicle models",
    },
    {
      title: "Late-Night Trips:",
      content:
        "Trips that extend into the night or start during late-night hours will incur additional charges.",
    },
    {
      title: "Geographical Travel Charges:",
      content:
        "Itineraries involving more than two crossings between central Lagos Island and the Mainland in a single trip will result in extra charges.",
    },
    {
      title: "Daily Rental Closing Time:",
      content:
        "Daily rentals end at 10 PM. Services used beyond this time are considered extra hours and will be charged accordingly.",
    },
  ];

  const airportPickUpAndDropOff = [
    {
      title: "Cancellation Policy:",
      content:
        "Cancellations are not permitted within one hour of the scheduled pick-up time. If you do not use the vehicle, no refund will be provided.",
    },
    {
      title: "Service Coverage:",
      content:
        "Each booking covers a single pick-up and drop-off. If the vehicle is used for additional airport trips within the same day, each trip will be considered a separate booking and will incur additional charges.",
    },
    {
      title: "Booking Duration:",
      content:
        "Airport pick-ups include a four-hour service window. If there are changes to your flight that require extending this window, an additional fee will be charged for each hour beyond the initial four hours. This service does not accommodate multiple pick-ups or unscheduled stops; additional requests will result in extra charges.",
    },
    {
      title: "Additional Fees:",
      content:
        "All airport tolls and parking fees incurred during the service are the responsibility of the client.",
    },
    {
      title: "Overtime Charges:",
      content:
        "Services extending beyond the included four-hour duration will incur overtime charges.",
    },
    {
      title: "Non-Stop Travel Requirement:",
      content:
        "The airport pick-up and drop-off service is designed for direct travel from the pick-up point to the destination without unscheduled stops. Requests for stops during the journey are treated as separate bookings and will incur additional charges.",
    },
  ];

  const selfDrive = [
    {
      title: "Eligibility and Documentation:",
      content:
        "Self-drive options are available for select vehicles. Before accepting a self-drive request, we require the submission of specific documents to verify eligibility.",
    },
    {
      title: "Repairs and Maintenance:",
      content: "",
      subItems: [
        "Minor Repairs: Renters are responsible for all minor repairs during the rental period, such as issues related to the battery or flat tyres.",
        "Major Repairs: Any major repairs required, especially those involving engine work, must be reported to Muvment immediately for appropriate handling.",
      ],
    },
    {
      title: "Payment and Agreement:",
      content:
        "Upon completing payment for a self-drive rental, renters are obligated to adhere to all terms and conditions as outlined in the service level agreement.",
    },
    {
      title: "Identity Verification:",
      content:
        "A mandatory identity verification must be completed before any self-drive rental can commence. This verification process is completed 48 hours after payment is received.",
    },
    {
      title: "Geographical Limitations:",
      content:
        "Renters agree to operate the vehicle only within the geographical boundaries specified in the rental agreement and invoice. Violations, such as driving the vehicle beyond the designated area, will result in automatic forfeiture of any caution fee or remaining balance associated with the booking. This is crucial for ensuring the safety and proper usage of our vehicles.",
    },
  ];

  const monthlyBooking = [
    {
      title: "Booking Duration and Usage:",
      content:
        "When you reserve a vehicle for a monthly period, the booking is strictly valid for the dates specified in the invoice. Unused days within this period cannot be carried over or extended beyond the specified end date. If you require the vehicle beyond the contracted period, additional days are subject to availability and will be charged at our standard daily rate.",
    },
    {
      title: "Driver Assignment:",
      content:
        "A primary driver will be assigned to you at the start of the booking. Our drivers typically work six days a week; therefore, your assigned driver will have one day off each week. During the monthly booking, driver changes might occur due to scheduling or operational needs.",
    },
    {
      title: "Driver Changes:",
      content:
        "Muvment reserves the right to change the assigned driver as necessary. Reasons for changes include but are not limited to operational requirements or driver availability. You will be notified at least 4 hours before your scheduled pickup time, and we will provide the new driver's information and details.",
    },
  ];

  const acceptanceOfTermsthroughPayment = [
    {
      title: "",
      content:
        "By making any partial or full payment for an invoice issued by Muvment, the customer is automatically deemed to agree to and accept all the Terms and Conditions set forth by Muvment. This agreement takes effect upon the successful processing of either a partial or full payment. Such payment constitutes the customer's explicit acknowledgment and acceptance of all terms, including specific liabilities or service terms detailed in our agreement. Customers are presumed to have read, understood, and consented to all these terms. We encourage customers to contact Muvment for any clarifications or inquiries regarding these terms prior to making any payment. Records of all payments, partial or full, will be maintained as evidence of the customer's acceptance of these terms.",
    },
  ];

  const conclusion = [
    {
      title: "",
      content:
        "Thank you for choosing Muvment. We value your trust and strive to provide exceptional service and convenience. By agreeing to these Terms and Conditions, you help ensure a smooth and enjoyable experience with our services. Should you have any questions or need further clarification on any aspect of these terms, please do not hesitate to contact our customer support team. We are here to assist you and ensure your satisfaction with our services.",
    },
    {
      title: "",
      content:
        "Muvment reserves the right to update and modify these Terms and Conditions at any time to reflect changes in our services or response to customer feedback or legal requirements. Such modifications will be effective immediately upon posting on our website or direct communication to you.",
    },
    {
      title: "",
      content:
        "We look forward to serving you and providing a reliable and enjoyable experience.",
    },
  ];

  const contactInformation = [
    {
      title: "",
      content:
        "Should you have any questions or need further clarification on any aspect of these terms, please do not hesitate to contact our customer support team at the following:",
      subItems: ["Email: info@muvment.ng", "Website: https://muvment.ng"],
      links: [
        { type: "email", href: "mailto:info@muvment.ng" },
        { type: "website", href: "https://muvment.ng" },
      ],
    },
  ];

  const VersionRepresentation = [
    {
      title: "",
      content:
        "These Terms and Conditions serve as the current and complete representation of all AutoGirl policies, rules, and user obligations. This version supersedes and replaces all previously published Terms and Conditions formerly hosted at https://autogirl.ng/terms-conditions/, which is currently not accessible.",
    },
    {
      title: "",
      content:
        "By continuing to use our services or platforms, all customers acknowledge and agree that these updated Terms and Conditions are the official and governing terms of AutoGirl Limited.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative h-64 lg:h-[500px] w-full bg-[#0673FF]">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center">
            <h1 className="text-white text-center text-2xl md:text-5xl font-semibold px-8">
              Terms & Conditions
            </h1>
          </div>
        </div>
        <div className="absolute bottom-[-20px] right-4 bg-[#0D419B]/90 px-4 py-2 rounded-lg shadow-md z-20">
          <p className="text-xs md:text-sm font-medium text-white">
            Last updated: {currentDate}
          </p>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm">
        <div className="overflow-x-auto py-3 scrollbar-hide">
          <div className="flex space-x-4 px-4 min-w-max">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "text-[#0673FF] bg-blue-50"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex gap-8">
          {/* Desktop Navigation Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex flex-col space-y-1 p-4 border-2 border-gray-200 bg-white rounded-2xl">
                <p className="py-2 mb-3 text-[#101928] font-medium text-sm border-b-2 border-[#E4E7EC]">
                  Quick Navigation
                </p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`px-4 py-3 rounded-lg text-left text-sm transition-colors ${
                      activeSection === section.id
                        ? "text-[#0673FF] bg-blue-50"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            {/* General Terms */}
            <section id="general-terms" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                General Terms
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {generalTerms[0]}
              </p>
            </section>

            {/* General Rental */}
            <section id="general-rental" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                General Rentals
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {generalRentalItems.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {item.title}
                  </li>
                ))}
              </ol>
            </section>

            {/* Cancellation and Refunds */}
            <section id="cancellation-refunds" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Cancellation and Refunds
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {cancellationNoticeItems.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.content}
                      </p>
                    )}
                    {item.subItems && (
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex} className="text-gray-700 text-sm">
                            {subItem}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Complimentary Ride */}
            <section id="complimentary-ride" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Complimentary Ride
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {complimentaryRide.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.content}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Extra Charges */}
            <section id="extra-charges" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Extra Charges
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {extraCharges.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.content}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Airport PickUp and Drop Off */}
            <section
              id="airport-pick-up-and-drop-off"
              className="mb-8 sm:mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Airport PickUp and Drop Off
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {airportPickUpAndDropOff.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.content}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Self Drive */}
            <section id="self-drive" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Self Drive
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {selfDrive.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.content}
                      </p>
                    )}
                    {item.subItems && (
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex} className="text-gray-700 text-sm">
                            {subItem}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Monthly Booking */}
            <section id="monthly-booking" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Monthly Booking
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {monthlyBooking.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.content}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Acceptance Of Terms through Payment */}
            <section
              id="acceptance-of-terms-through-payment"
              className="mb-8 sm:mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Acceptance Of Terms through Payment
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {acceptanceOfTermsthroughPayment[0].content}
              </p>
            </section>

            {/* Conclusion */}
            <section id="conclusion" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Conclusion
              </h2>
              <div className="space-y-4">
                {conclusion.map((item, index) => (
                  <p
                    key={index}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {item.content}
                  </p>
                ))}
              </div>
            </section>

            {/* Contact Information */}
            <section id="contact-information" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {contactInformation[0].content}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                {contactInformation[0].subItems.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {contactInformation[0].links &&
                    contactInformation[0].links[index] ? (
                      <a
                        href={contactInformation[0].links[index].href}
                        className="text-blue-600 hover:underline"
                      >
                        {item}
                      </a>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section id="Version-Representation" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Version & Representation of Prior Terms
              </h2>
              <div className="space-y-4">
                {VersionRepresentation.map((item, index) => (
                  <p
                    key={index}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {item.content}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="text-center p-3">
        <a href="/">Back Home</a>
      </div>
    </div>
  );
}

export default TermsOfServiceClient;
