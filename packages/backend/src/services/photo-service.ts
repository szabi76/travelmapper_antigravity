
export class PhotoService {
    private accessKey: string;
    private baseUrl = 'https://api.unsplash.com';

    constructor() {
        this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    }

    async getPhotos(query: string, limit: number = 3): Promise<string[]> {
        if (!this.accessKey) {
            console.warn('UNSPLASH_ACCESS_KEY not set. Skipping photo fetch.');
            return [];
        }

        try {
            const url = `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`
                }
            });

            if (!response.ok) {
                console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = await response.json() as any;
            if (!data.results || !Array.isArray(data.results)) {
                return [];
            }

            // Return small/regular URLs
            return data.results.map((photo: any) => photo.urls.regular || photo.urls.small);
        } catch (error) {
            console.error('Failed to fetch photos from Unsplash', error);
            return [];
        }
    }
}
