
export class PhotoService {
    private accessKey: string;
    private baseUrl = 'https://api.unsplash.com';

    constructor() {
        this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    }

    async getPhotos(query: string, limit: number = 3): Promise<{ urls: string[], debug: any, error?: string }> {
        const debug: any = { query, limit, provider: 'unsplash' };

        if (!this.accessKey) {
            debug.error = 'Missing UNSPLASH_ACCESS_KEY';
            return { urls: [], debug, error: 'Missing UNSPLASH_ACCESS_KEY' };
        }

        try {
            const url = `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;
            debug.requestUrl = url.replace(this.accessKey, 'HIDDEN'); // Hide key in logs if it were there (it's in header though)

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.accessKey}`
                }
            });

            debug.status = response.status;

            if (!response.ok) {
                const text = await response.text();
                console.error(`Unsplash API error: ${response.status}`, text);
                debug.errorBody = text;
                return { urls: [], debug, error: `Unsplash API ${response.status}: ${text}` };
            }

            const data = await response.json() as any;
            if (!data.results || !Array.isArray(data.results)) {
                return { urls: [], debug, error: 'Invalid API response format' };
            }

            debug.totalFound = data.total;
            debug.totalPages = data.total_pages;
            debug.returned = data.results.length;

            // Return small/regular URLs
            return { urls: data.results.map((photo: any) => photo.urls.regular || photo.urls.small), debug };
        } catch (error) {
            console.error('Failed to fetch photos from Unsplash', error);
            debug.exception = String(error);
            return { urls: [], debug, error: `Fetch failed: ${String(error)}` };
        }
    }
}
