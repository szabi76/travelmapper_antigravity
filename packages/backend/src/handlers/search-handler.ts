import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GeoService } from '../services/geo-service';

const geoService = new GeoService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Auth Check
    const authHeader = event.headers['Authorization'] || event.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET_TOKEN}`) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    const query = event.queryStringParameters?.q;
    if (!query) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing query parameter (q)' }) };
    }

    try {
        console.log(`Searching location: ${query}`);
        const results = await geoService.search(query);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(results)
        };
    } catch (e) {
        console.error('Search failed', e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error', error: String(e) })
        };
    }
};
