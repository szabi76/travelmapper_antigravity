
export interface LocationData {
    latitude: number;
    longitude: number;
    altitude?: number;
    placeName: string;
}

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export class GeoService {

    async getLocationData(query: string): Promise<LocationData | null> {
        if (!MAPBOX_TOKEN) {
            console.warn('MAPBOX_ACCESS_TOKEN not set');
            return null;
        }

        try {
            // 1. Geocoding
            const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.features || geoData.features.length === 0) {
                console.log(`No location found for: ${query}`);
                return null;
            }

            const feature = geoData.features[0];
            const [lng, lat] = feature.center;
            const placeName = feature.place_name;

            // 2. Altitude (Tilequery)
            // querying mapbox.mapbox-terrain-v2
            const eleUrl = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lng},${lat}.json?layers=contour&limit=50&access_token=${MAPBOX_TOKEN}`;
            const eleRes = await fetch(eleUrl);
            const eleData = await eleRes.json();

            let altitude = 0;
            if (eleData.features && eleData.features.length > 0) {
                // Get the elevation from the first feature or average/max
                // Mapbox tilequery returns features with 'ele' property
                // We pick the highest confidence or just the first.
                // Usually returns multiple points in the tile.
                // Let's take the max elevation found to be safe for "peaks", or average?
                // For a specific point, they should be close.
                // tilequery returns features sorted by distance/relevance usually.
                altitude = eleData.features[0].properties.ele;
            }

            return {
                latitude: lat,
                longitude: lng,
                altitude,
                placeName
            };

        } catch (error) {
            console.error('GeoService error:', error);
            return null;
        }
    }
}
