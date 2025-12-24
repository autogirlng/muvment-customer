"use client";
import { useState, useEffect } from "react";

function PrivacyPolicyClient() {
  const [activeSection, setActiveSection] = useState("policy-statement");

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    { id: "policy-statement", label: "Policy Statement" },
    { id: "collection-of-information", label: "Collection of Information" },
    { id: "use-of-information", label: "Use of Information" },
    { id: "sharing-of-information", label: "Sharing of Information" },
    { id: "data-retention-and-security", label: "Data Retention and Security" },
    { id: "your-rights", label: "Your Rights" },
    { id: "policy-changes", label: "Policy Changes" },
    { id: "questions-and-changes", label: "Questions and Changes" },
    { id: "contact-information", label: "Contact Information" },
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
        const sectionTop = section?.offsetTop;
        const sectionHeight = section?.clientHeight;
        const sectionId = section?.getAttribute("id");

        if (
          sectionTop !== undefined &&
          sectionHeight !== undefined &&
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

  const policyStatement = [
    "Welcome to Muvment's Privacy Policy. We are a Nigerian Vehicle Rental Company providing Cars, Boats, and Jets. This policy outlines how we collect, use, store, and protect your personal information. It also details your rights regarding that information. Please note, this policy does not apply to our licensees, affiliates, or other third parties you may interact with through our services.",
  ];

  const collectionOfInformation = [
    { title: "Methods of Collection:", content: "" },
    {
      title: "We collect personal data through various channels, including:",
      content: "",
      subItems: [
        "Our websites and mobile apps",
        "Phone calls and customer service contacts",
        "Rental vehicles",
        "Third-party service providers and business partners",
      ],
    },
    {
      title: "Types of Information Collected:",
      content: "",
      subItems: [
        "Personal Information: Name, age, gender, address, email, phone number, passport number, driver's license, ID photographs, pickup/drop-off locations, areas of use, and duration of use.",
        "Technological Information: IP address, device ID, browser type, operating system, mobile device identifiers, geo-location data, and details about your interactions with our websites.",
        "Rental Information: Name, email, phone number, pickup/drop-off locations, charges incurred, and duration of use.",
        "Vehicle Data: Telematics data such as vehicle condition, performance, location, and driver operation during the rental period.",
        "Sensitive Data: Health-related information for accommodations or in case of an accident, collected with your consent.",
        "Cookies and Online Data Collection: We use cookies to enhance your experience on our websites. Cookies help with website functionality, performance analysis, and targeted advertising. You may manage your cookie preferences through your browser settings.",
      ],
    },
  ];

  const useOfInformation = [
    {
      title: "Purpose:",
      content: "",
      subItems: [
        "Operations and Services: To provide the services you request, including rental reservations, billing, and customer support.",
        "Marketing: With your consent, to send you promotional offers and information about our products and services.",
        "Third-Party Marketing: With your consent, to share your information with third parties that may offer promotions of interest to you.",
        "Business Operations: To comply with legal obligations, protect our interests, enforce our terms, and manage business transactions.",
        "Telematics: To track vehicle performance, safety, and location for billing accuracy and security.",
      ],
    },
  ];

  const sharingOfInformation = [
    {
      title: "With Service Providers and Partners:",
      content:
        "We may share your personal data with trusted third-party providers and partners to fulfill services, process transactions, and enhance your rental experience. This includes:",
      subItems: [
        "Agents, licensees, and companies involved in your rental.",
        "Service providers who assist in business operations, marketing, and research.",
      ],
    },
    {
      title: "For Legal and Protective Reasons:",
      content:
        "We may disclose your data to comply with legal requirements, protect our rights, and manage claims or disputes.",
    },
    {
      title: "Corporate Transactions:",
      content:
        "In a merger, sale, or other business transaction, your data may be transferred as part of the process.",
    },
  ];

  const dataRetentionAndSecurity = [
    {
      title: "Data Retention:",
      content:
        "We retain personal data as long as necessary for the purposes it was collected, or as required by law. Retention periods vary based on the type of data and legal obligations.",
    },
    {
      title: "Security Measures:",
      content:
        "We implement reasonable administrative, technical, and physical measures to safeguard your data against unauthorized access, loss, or modification. Servers storing your data are primarily located in Nigeria, with some information stored in other locations.",
    },
    {
      title: "Transmission Security:",
      content:
        "While we strive to protect your data, no transmission method is completely secure. We encourage you to use secure communication methods when necessary and avoid sharing sensitive information through unencrypted channels.",
    },
  ];

  const yourRights = [
    {
      title: "You have the following rights regarding your personal data:",
      content: "",
      subItems: [
        "Access and Update: Request access to and update your personal data.",
        "Rectification: Correct any inaccuracies in your personal data.",
        "Objection to Processing: Object to the processing of your data for direct marketing or other legitimate interests.",
        "Erasure: Request the deletion of your data under certain circumstances.",
        "Restriction of Processing: Limit how your data is processed in specific situations.",
        "Data Portability: Receive your data in a portable format or request its transfer to another organization.",
        "Withdrawal of Consent: Withdraw consent for data processing at any time.",
      ],
    },
    {
      title:
        "To exercise these rights, please contact us as described in Section 6.",
      content: "",
    },
  ];

  const policyChanges = [
    {
      title: "",
      content:
        "We reserve the right to update this policy at any time. Changes will be effective upon posting and will not apply retroactively. Material changes will be noted on our website with the updated date.",
    },
  ];

  const questionsAndChanges = [
    {
      title: "",
      content:
        "Contact Us: If you have questions or concerns about our privacy practices, or wish to exercise your rights, please contact our Data Protection Officer at info@muvment.ng or write to:",
      subItems: ["Muvment, 16 Bankole Street, Oregun, Ikeja, Lagos, Nigeria"],
    },
    {
      title: "",
      content:
        "For general customer support inquiries, please visit our website and click the 'Contact Us' link.",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative h-64 lg:h-[500px] w-full bg-[#0673FF]">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center">
            <h1 className="text-white text-center text-2xl md:text-5xl font-semibold px-8">
              Privacy Policy
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
            {/* Policy Statement */}
            <section id="policy-statement" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Policy Statement
              </h2>
              {policyStatement.map((text, i) => (
                <p
                  key={i}
                  className="text-sm text-gray-700 leading-relaxed mb-4"
                >
                  {text}
                </p>
              ))}
            </section>

            {/* Collection of Information */}
            <section id="collection-of-information" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Collection of Information
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {collectionOfInformation.map((item, index) => (
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

            {/* Use of Information */}
            <section id="use-of-information" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Use of Information
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {useOfInformation.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
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

            {/* Sharing of Information */}
            <section id="sharing-of-information" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Sharing of Information
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {sharingOfInformation.map((item, index) => (
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

            {/* Data Retention and Security */}
            <section id="data-retention-and-security" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Data Retention and Security
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {dataRetentionAndSecurity.map((item, index) => (
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

            {/* Your Rights */}
            <section id="your-rights" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Your Rights
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {yourRights.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.title && (
                      <h4 className="text-sm font-semibold">{item.title}</h4>
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

            {/* Policy Changes */}
            <section id="policy-changes" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Policy Changes
              </h2>
              {policyChanges.map((item, index) => (
                <p
                  key={index}
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  {item.content}
                </p>
              ))}
            </section>

            {/* Questions and Changes */}
            <section id="questions-and-changes" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Questions and Changes
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {questionsAndChanges.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.content && (
                      <p className="text-sm text-gray-700">{item.content}</p>
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

            {/* Contact Information */}
            <section id="contact-information" className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <ol className="list-decimal pl-6 space-y-4">
                {contactInformation.map((item, index) => (
                  <li key={index} className="text-base text-gray-800">
                    {item.content && (
                      <p className="text-sm text-gray-700 mb-2">
                        {item.content}
                      </p>
                    )}
                    {item.subItems && (
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex} className="text-gray-700 text-sm">
                            {item.links && item.links[subIndex] ? (
                              <a
                                href={item.links[subIndex].href}
                                className="text-blue-600 hover:underline"
                              >
                                {subItem}
                              </a>
                            ) : (
                              subItem
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
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

export default PrivacyPolicyClient;
