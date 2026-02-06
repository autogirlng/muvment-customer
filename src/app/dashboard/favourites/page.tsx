import FavouritesClientPage from "@/components/pagesComponent/FavouritesClientPage";
import { generatePageMetadata } from "@/helpers/metadata";


export function generateMetadata() {


    let title = `Rent Your Favorite Vehicles`;

    let description = `Browse your favorite vehicles.`;


    return generatePageMetadata({
        title,
        description,
        url: `/dashboard/favourites`,
    });
}

export default function Page() {
    return <FavouritesClientPage />;
}
