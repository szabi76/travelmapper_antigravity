
export class PhotoService {
    private accessKey: string;
    private baseUrl = 'https://api.unsplash.com';

    constructor() {
        this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    }

    async getPhotos(query: string, limit: number = 3): Promise<{ urls: string[], error?: string }> {
        if (!this.accessKey) {
            return { urls: [], error: 'Missing UNSPLASH_ACCESS_KEY' };
        }

        try {
            const url = `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Unsplash API error: ${response.status}`, text);
                return { urls: [], error: `Unsplash API ${response.status}: ${text}` };
            }

            const data = await response.json() as any;
            if (!data.results || !Array.isArray(data.results)) {
                return { urls: [], error: 'Invalid API response format' };
            }

            // Return small/regular URLs
            return { urls: data.results.map((photo: any) => photo.urls.regular || photo.urls.small) };
        } catch (error) {
            console.error('Failed to fetch photos from Unsplash', error);
            return { urls: [], error: `Fetch failed: ${String(error)}` };
        }
    }
}
