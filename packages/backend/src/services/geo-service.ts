
export interface LocationData {
    latitude: number;
    longitude: number;
    altitude?: number;
    placeName: string;
}

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export class GeoService {

    async getLocationData(query: string): Promise<{ data: LocationData | null, debug: any }> {
        const debug: any = { query, provider: 'mapbox' };

        if (!MAPBOX_TOKEN) {
            console.warn('MAPBOX_ACCESS_TOKEN not set');
            debug.error = 'MAPBOX_ACCESS_TOKEN not set';
            return { data: null, debug };
        }

        try {
            // 1. Geocoding
            const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json() as any;

            if (!geoData.features || geoData.features.length === 0) {
                console.log(`No location found for: ${query}`);
                debug.geoFound = false;
                return { data: null, debug };
            }

            const feature = geoData.features[0];
            const [lng, lat] = feature.center;
            const placeName = feature.place_name;

            debug.geoFound = true;
            debug.coordinates = [lat, lng];
            debug.placeName = placeName;

            // 2. Altitude (Tilequery)
            const eleUrl = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lng},${lat}.json?layers=contour&limit=50&access_token=${MAPBOX_TOKEN}`;
            const eleRes = await fetch(eleUrl);
            const eleData = await eleRes.json() as any;

            let altitude = 0;
            if (eleData.features && eleData.features.length > 0) {
                altitude = eleData.features[0].properties.ele;
            }
            debug.altitude = altitude;
            debug.response = {
                geo: geoData,
                elevation: eleData
            }; // Full payload

            return {
                data: {
                    latitude: lat,
                    longitude: lng,
                    altitude,
                    placeName
                },
                debug
            };

        } catch (error) {
            console.error('GeoService error:', error);
            debug.error = String(error);
            return { data: null, debug };
        }
    }
}
