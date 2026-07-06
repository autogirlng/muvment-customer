import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/helpers/metadata";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/HomeComponent/Footer";

export const revalidate = 3600;

const API_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "https://api-muvment.up.railway.app"
}/api/v1`;

export const metadata: Metadata = generatePageMetadata({
  title: "Browse All Rental Cars in Nigeria",
  description:
    "Browse every car available for rent on Muvment across Nigeria. Sedans, SUVs, buses, and luxury vehicles with professional chauffeurs for hourly, daily, and monthly hire.",
  url: "/vehicles",
  keywords: [
    "rent a car Nigeria",
    "car hire Lagos",
    "car rental Abuja",
    "chauffeur car hire",
    "all rental cars",
  ],
});

type Vehicle = { slug: string; name: string; city?: string };

async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch(
      `${API_URL}/public/vehicles/search?page=0&size=2000`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const content = json?.data?.content;
    if (!Array.isArray(content)) return [];
    return content
      .filter((v: { slug?: string; name?: string }) => v?.slug && v?.name)
      .map((v: { slug: string; name: string; city?: string }) => ({
        slug: v.slug,
        name: v.name,
        city: v.city,
      }));
  } catch {
    return [];
  }
}

function titleCase(value: string) {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : value;
}

export default async function VehiclesIndexPage() {
  const vehicles = await getAllVehicles();

  const byCity = new Map<string, Vehicle[]>();
  for (const v of vehicles) {
    const city = titleCase(v.city || "Other");
    if (!byCity.has(city)) byCity.set(city, []);
    byCity.get(city)!.push(v);
  }
  const cities = Array.from(byCity.keys()).sort();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mt-16">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Browse all rental cars
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Every vehicle available for rent on Muvment across Nigeria. Pick a
            car to see its rates and book with a professional chauffeur, for
            hourly, daily, or monthly hire.
          </p>

          {vehicles.length === 0 ? (
            <p className="mt-8 text-sm text-gray-500">
              We could not load the list right now. You can{" "}
              <Link
                href="/booking/search"
                className="text-[#0673ff] underline"
              >
                browse cars here
              </Link>{" "}
              instead.
            </p>
          ) : (
            <div className="mt-8 space-y-10">
              {cities.map((city) => (
                <section key={city}>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cars in {city}
                  </h2>
                  <ul className="mt-3 grid list-none grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    {byCity.get(city)!.map((v) => (
                      <li key={v.slug}>
                        <Link
                          href={`/booking/details/${v.slug}`}
                          className="text-sm text-gray-700 hover:text-[#0673ff] hover:underline"
                        >
                          {v.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
