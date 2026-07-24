// Single source of truth for the FAQ content.
// Both the FAQ page (src/app/faq/FAQPageClient.tsx) and the JSON-LD schema
// (src/helpers/schema.tsx) read from here so the visible answers and the
// structured data always match.

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  label: string;
  items: FaqItem[];
};

export const faqSections: FaqSection[] = [
  {
    id: "booking-account",
    label: "Booking & Account",
    items: [
      {
        id: "faq-need-account",
        question: "Do I need an account to book?",
        answer:
          "No, you don't need to create an account to book. However, you must provide accurate contact details, including an emergency contact, so we can properly identify and reach you, especially for support or in case of an emergency.",
      },
      {
        id: "faq-how-to-book",
        question: "How do I book a car on Muvment?",
        answer:
          "Choose your city and travel dates, pick a vehicle, and confirm with payment. Bookings are made online on muvment.ng, and your booking is confirmed once payment is received.",
      },
      {
        id: "faq-cities",
        question: "Which cities does Muvment operate in?",
        answer:
          "We currently serve Lagos, Abuja, Benin City, Enugu, and Port Harcourt in Nigeria, and Accra in Ghana.",
      },
      {
        id: "faq-foreigners",
        question: "Can foreigners or visitors rent a car with Muvment?",
        answer:
          "Yes. We accept international driver's licenses and international card payments, which makes Muvment a good fit for diaspora travellers and business visitors.",
      },
      {
        id: "faq-verified",
        question: "Are the cars and owners on Muvment verified?",
        answer:
          "Yes. Vehicles are listed by verified owners whose names match the vehicle papers, and every listing is vetted before it goes live.",
      },
    ],
  },
  {
    id: "pricing-payments",
    label: "Pricing, Payments & Fees",
    items: [
      {
        id: "faq-see-price",
        question: "How do I see the price for my trip?",
        answer:
          "Prices depend on your city, vehicle, dates, and trip details. To see an exact price, start a booking on muvment.ng or contact our booking team and we'll confirm the cost for you.",
      },
      {
        id: "faq-lagos-pricing",
        question: "Are prices the same across all locations in Lagos?",
        answer:
          "Our pricing covers most central areas in Lagos. Trips involving outskirts locations such as Sangotedo, Ikorodu Town, Festac, Badagry, or Alimosho attract additional charges that reflect the longer travel times and logistics involved in serving those areas.",
      },
      {
        id: "faq-outskirts",
        question: "Which areas count as outskirts?",
        answer:
          "Outskirts include, but are not limited to, Sangotedo, Badagry, Amuwo Odofin, Festac Town, Alaba, Ikorodu Town, Agbara, Agege, Epe, Free Trade Zone, Igando, Akowonjo, Dopemu, Ajah, Agbado, Ojodu Berger, Ajegunle, Ibese, Iyana Ipaja, Alimosho, and Ibeju Lekki.",
      },
      {
        id: "faq-late-night-fee",
        question: "Are there extra charges for late-night or early-morning bookings?",
        answer:
          "Yes. Bookings that begin between 10:00 PM and 6:00 AM attract an additional late-hour fee, which is shown at the time of booking.",
      },
      {
        id: "faq-island-mainland",
        question: "Are there charges for crossing between the Island and Mainland?",
        answer:
          "Yes. Trips with more than two crossings between central Lagos Island and the Mainland in a single day attract an additional charge.",
      },
      {
        id: "faq-payment-confirms",
        question: "How does payment confirm my booking?",
        answer:
          "Making a partial or full payment confirms your booking and means you accept our Terms and Conditions. We recommend reading the terms, or asking us any questions, before you pay.",
      },
    ],
  },
  {
    id: "rental-periods",
    label: "Rental Periods & Extensions",
    items: [
      {
        id: "faq-standard-period",
        question: "How long is the standard rental period on Muvment?",
        answer:
          "Our standard rental period is 12 hours. Any use of the vehicle beyond this time will attract overtime charges, which vary depending on the vehicle category. You can view applicable overtime rates at checkout or in your booking summary.",
      },
      {
        id: "faq-daily-end-time",
        question: "What time does a daily rental end?",
        answer:
          "Daily rentals end at 10:00 PM. Use beyond this is treated as extra hours and charged accordingly.",
      },
      {
        id: "faq-extend",
        question: "What happens if I need the car for longer than 12 hours?",
        answer:
          "If you plan to extend your trip, please make the request and complete payment before your initial 12-hour period expires. This keeps the vehicle available for you and avoids overtime disputes. If payment isn't made in time, the driver may leave after notifying you by call or SMS.",
      },
      {
        id: "faq-overtime",
        question: "How are overtime charges calculated?",
        answer:
          "Overtime rates vary by vehicle type. Newer models (2021 onwards), bulletproof vehicles, buses, vintage cars, and luxury cars are charged at higher rates than standard vehicles.",
      },
    ],
  },
  {
    id: "fuel",
    label: "Fuel",
    items: [
      {
        id: "faq-fuel-during",
        question: "Do I need to fuel the car during my rental?",
        answer:
          "Every booking starts with fuel included: 30 litres for sedans and 35 litres for SUVs. If the fuel runs out during your trip, you top up enough to complete the journey, with a minimum refuel of ₦12,000 for sedans and ₦20,000 for SUVs. Monthly bookings are the exception, where fuel is not included unless you request it.",
      },
      {
        id: "faq-full-tank",
        question: "Can I start with a full tank?",
        answer:
          "Yes. Ask for it when you book, or tell our booking team before your trip starts: ₦35,000 for a sedan and ₦55,000 for an SUV. It must be confirmed and paid before your booking starts, and it is available on both standard rentals and travel bookings. The minimum refuel amounts still apply if the fuel runs out during your trip.",
      },
    ],
  },
  {
    id: "drivers-vehicles",
    label: "Drivers & Vehicles",
    items: [
      {
        id: "faq-comes-with-driver",
        question: "Do all Muvment rentals come with a driver?",
        answer:
          "Yes. Every rental includes a vetted, experienced chauffeur who knows the city, so there is no security deposit to pay, no liability if something happens, and no navigating traffic yourself.",
      },
      {
        id: "faq-same-driver",
        question: "Will I always have the same driver during my trip?",
        answer:
          "For trips that last three days or longer, your assigned chauffeur may be rotated for another verified Muvment driver. This rotation is for safety, so drivers stay well-rested and alert. All our chauffeurs are professional, courteous, and fully vetted.",
      },
      {
        id: "faq-reject-vehicle",
        question: "Can I reject a vehicle if something is wrong with it?",
        answer:
          "Yes. You have a one-hour inspection window once the vehicle is delivered. If there's a mechanical issue, such as a faulty AC, you can reject the vehicle within that period and our support team will step in to assist.",
      },
      {
        id: "faq-forgot-item",
        question: "What happens if I forget something in the vehicle?",
        answer:
          "Please notify us within 24 hours of the trip ending if you've left something behind. While we do our best to help, Muvment is not liable for lost items after that window.",
      },
      {
        id: "faq-vehicle-types",
        question: "What types of vehicles can I rent?",
        answer:
          "Our fleet ranges from economy and executive sedans to SUVs, premium and luxury vehicles, and buses for groups. You can browse the available categories and live availability on the homepage when you search.",
      },
    ],
  },
  {
    id: "airport-pickups",
    label: "Airport Pickups",
    items: [
      {
        id: "faq-airport-offer",
        question: "Does Muvment offer airport pickups?",
        answer:
          "Yes. We offer pre-booked airport pickups so your driver is ready when you land. To see the price for your route and vehicle, start a booking on muvment.ng or contact our booking team.",
      },
      {
        id: "faq-airport-window",
        question: "How long does an airport pickup cover?",
        answer:
          "Airport pickups include a four-hour service window and cover a single pickup and drop-off. Extra hours, additional trips, or unscheduled stops attract extra charges. Airport tolls and parking are the client's responsibility.",
      },
      {
        id: "faq-airport-bolt",
        question: "Should I use Bolt or Uber from the airport instead?",
        answer:
          "You can, but you will walk to the official pickup point and surge pricing is common at peak times. For first-time visitors with luggage, a pre-booked pickup is much smoother.",
      },
      {
        id: "faq-airport-arrival",
        question: "When should my driver arrive for a pickup?",
        answer:
          "Your driver should be at the airport 15 to 30 minutes before your flight lands.",
      },
    ],
  },
  {
    id: "monthly-rentals",
    label: "Monthly & Long-Term Rentals",
    items: [
      {
        id: "faq-monthly-cost",
        question: "How much does a monthly rental cost?",
        answer:
          "Monthly rates depend on the vehicle and your usage. To get a current quote, start a booking on muvment.ng or contact our booking team.",
      },
      {
        id: "faq-monthly-fuel",
        question: "Is fuel included in a monthly rental?",
        answer:
          "No. Fuel is not included in monthly bookings unless you request it as part of your arrangement. Please confirm your fuel arrangement with our booking team when you book.",
      },
      {
        id: "faq-monthly-driver",
        question: "Do monthly rentals come with a driver?",
        answer:
          "Yes. All Muvment monthly rentals include a vetted professional driver as standard. Drivers typically work six days a week, so your driver has one day off each week.",
      },
      {
        id: "faq-monthly-vs-leasing",
        question: "How is monthly rental different from leasing?",
        answer:
          "Leasing usually needs a long commitment and may involve ownership transfer. Monthly rental is shorter and flexible (1 to 12 months), and the vehicle returns to the platform at the end.",
      },
      {
        id: "faq-monthly-documents",
        question: "What documents do I need for a monthly rental?",
        answer:
          "A valid government-issued ID (Nigerian or international), proof of address, your contact details, and a deposit. Long-term rentals may require employer or business details.",
      },
      {
        id: "faq-monthly-extend",
        question: "Can I extend my monthly rental?",
        answer:
          "Yes, subject to availability. Confirm the extension policy when you book; during peak seasons, extensions may be limited if the vehicle is already reserved.",
      },
      {
        id: "faq-monthly-problem",
        question: "What if the car has a problem during my monthly rental?",
        answer:
          "We arrange a replacement vehicle, typically within hours. Confirm this is part of your agreement when you book.",
      },
    ],
  },
  {
    id: "weddings-events",
    label: "Weddings & Events",
    items: [
      {
        id: "faq-wedding-hire",
        question: "Can I hire a wedding car with Muvment?",
        answer:
          "Yes. We offer wedding and event cars with a trained chauffeur. For packages and pricing, start a booking on muvment.ng or contact our booking team.",
      },
      {
        id: "faq-wedding-book-early",
        question: "How early should I book a wedding car?",
        answer:
          "For premium or limited vehicles, book 4 to 6 months ahead. For standard luxury cars, 2 to 4 months is usually enough. December and January weddings should be booked earlier due to high demand.",
      },
      {
        id: "faq-wedding-decoration",
        question: "Is decoration included?",
        answer:
          "Basic ribbon decoration is usually included. Full floral decoration is available at an extra cost. Always get the inclusion list in writing before you book.",
      },
      {
        id: "faq-wedding-breakdown",
        question: "What happens if the wedding car breaks down on the day?",
        answer:
          "Reputable providers keep backup vehicles ready, and Muvment's wedding bookings include backup arrangements. Confirm this is in your contract.",
      },
      {
        id: "faq-wedding-driver",
        question: "Do wedding cars come with a driver?",
        answer:
          "Yes. Wedding car hire always includes a trained chauffeur who handles routing, timing, and venue arrivals.",
      },
    ],
  },
  {
    id: "travel-outside-lagos",
    label: "Travel Outside Lagos",
    items: [
      {
        id: "faq-outside-lagos",
        question: "Can I book a trip outside Lagos?",
        answer:
          "Yes, but any journey outside Lagos is treated as a full-day rental. Your rental period ends upon your return to Lagos; it does not continue after re-entry.",
      },
      {
        id: "faq-interstate-rules",
        question: "What are the rules for interstate trips?",
        answer:
          "Accommodation must be provided by the customer for the driver. Fuel is provided at the start, 30 litres for sedans and 35 litres for SUVs, and the client fuels from there once it finishes. For safety, we do not allow night travel on interstate trips; all interstate trips run during the day.",
      },
      {
        id: "faq-benin-republic",
        question: "Do you offer travel to Benin Republic?",
        answer:
          "Yes. Muvment offers cross-border travel to Benin Republic. Trip terms, required documents, and pricing are confirmed when you book.",
      },
      {
        id: "faq-driver-accommodation",
        question: "Do I need to provide accommodation for the driver on long trips?",
        answer:
          "Yes. Accommodation should be provided for drivers on journey or 24-hour bookings, and is required for interstate trips.",
      },
    ],
  },
  {
    id: "cancellations-refunds",
    label: "Cancellations & Refunds",
    items: [
      {
        id: "faq-cancellation-policy",
        question: "What is the cancellation and refund policy?",
        answer:
          "Cancellations with less than 72 hours' notice are not refunded. With more than 72 hours' notice, 50% is forfeited and the other 50% is refunded (within 24 hours of the request) or converted to booking credit.",
      },
      {
        id: "faq-december-cancel",
        question: "Can I cancel a December booking?",
        answer:
          "No. Due to high festive-season demand, all December bookings are non-cancellable and non-refundable. Be certain of your dates before you book.",
      },
      {
        id: "faq-how-to-cancel",
        question: "How do I cancel a booking?",
        answer:
          "Submit a formal request through WhatsApp or to our customer support team, including the reason. If it is not properly communicated before the start time, the booking period begins as planned.",
      },
      {
        id: "faq-faulty-refund",
        question: "Can I get a refund for a faulty vehicle?",
        answer:
          "Yes, if the vehicle is found faulty and reported to Muvment within one hour of use.",
      },
    ],
  },
  {
    id: "trust-safety",
    label: "Trust & Safety",
    items: [
      {
        id: "faq-safest-rent",
        question: "What is the safest way to rent a car in Nigeria?",
        answer:
          "Use a verified platform, or a company that owns and manages its vehicles. Muvment by Autogirl gives you both: cars are listed by verified owners whose names match the papers, on a platform with real bookings and reviews.",
      },
      {
        id: "faq-check-before-paying",
        question: "What should I check before paying for a rental?",
        answer:
          "Check reviews, availability, and the refund policy, and whether the provider owns the vehicle or runs a trusted marketplace. You can also search the company name online to see real customer feedback.",
      },
      {
        id: "faq-instagram-safe",
        question: "Is it safe to book car rentals through Instagram?",
        answer:
          "Not always. Many Instagram-based operators run informally, without structured booking systems or verified inventory. A platform with clear refund and cancellation policies is safer.",
      },
      {
        id: "faq-online-reliable",
        question: "Are online car rental bookings reliable in Nigeria?",
        answer:
          "They are when you use a platform with real-time booking and verified inventory like Muvment, rather than an informal operator.",
      },
    ],
  },
  {
    id: "hosting",
    label: "Hosting",
    items: [
      {
        id: "faq-hosting",
        question: "Can I earn money by listing my car on Muvment?",
        answer:
          "Yes. If you want to host your car and earn, Muvment has a dedicated hosting platform at host.muvment.ng, where you will find everything you need to get started, including a hosting FAQ.",
      },
    ],
  },
];

// Flat list, used by the JSON-LD FAQ schema.
export const faqFlat: FaqItem[] = faqSections.flatMap((section) => section.items);
