import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ddbDocClient } from '../utils/ddb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Session } from '../types';

const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const idParameter = event.pathParameters?.id;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    try {
        if (!idParameter) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };
        }

        let sessionId = idParameter;
        if (!sessionId.startsWith('SESSION#')) {
            sessionId = `SESSION#${sessionId}`;
        }

        if (method === 'GET') {
            const result = await ddbDocClient.send(new GetCommand({
                TableName: SESSIONS_TABLE,
                Key: { PK: sessionId, SK: 'STATE' }
            }));

            if (!result.Item) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Session not found' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify(result.Item) };
        }

        if (method === 'PUT') {
            const body = JSON.parse(event.body || '{}');
            const now = new Date().toISOString();

            const session: Session = {
                id: sessionId,
                ...body,
                lastUpdatedAt: now
            };

            await ddbDocClient.send(new PutCommand({
                TableName: SESSIONS_TABLE,
                Item: {
                    PK: sessionId,
                    SK: 'STATE',
                    ...session
                }
            }));

            return { statusCode: 200, headers, body: JSON.stringify(session) };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not Found' }) };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error', error: String(error) })
        };
    }
};
