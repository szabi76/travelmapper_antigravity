import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ddbDocClient } from '../utils/ddb';
import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Discovery, Node } from '../types';

const DISCOVERIES_TABLE = process.env.DISCOVERIES_TABLE!;
const NODES_TABLE = process.env.NODES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.resource;

    // Headers for CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    try {
        if (method === 'POST' && path === '/discoveries') {
            const body = JSON.parse(event.body || '{}');
            const { prompt } = body;

            if (!prompt) {
                return { statusCode: 400, headers, body: JSON.stringify({ message: 'Prompt required' }) };
            }

            const discoveryId = `DISCOVERY#${uuidv4()}`;
            const rootNodeId = `NODE#${uuidv4()}`;
            const now = new Date().toISOString();

            // Create Discovery Record
            const discovery: Discovery = {
                id: discoveryId,
                prompt,
                rootNodeId,
                createdAt: now,
                lastAccessedAt: now,
                status: 'active'
            };

            await ddbDocClient.send(new PutCommand({
                TableName: DISCOVERIES_TABLE,
                Item: {
                    PK: discoveryId,
                    SK: 'METADATA',
                    ...discovery
                }
            }));

            // Create Root Node (Virtual/Placeholder based on prompt)
            // Ideally, we might ask AI to flesh out the root node too, but for now we make a simple one.
            const rootNode: Node = {
                id: rootNodeId,
                discoveryId,
                type: 'template',
                category: 'Destination', // Defaulting to Destination for root
                title: prompt, // Using prompt as title initially
                content: { description: `Root node for: ${prompt}` },
                childrenLoaded: false,
                createdAt: now
            };

            await ddbDocClient.send(new PutCommand({
                TableName: NODES_TABLE,
                Item: {
                    PK: rootNodeId,
                    SK: 'METADATA',
                    ...rootNode,
                    // GSI attribute
                    discoveryId: discoveryId
                }
            }));

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(discovery)
            };
        }

        if (method === 'GET' && path === '/discoveries') {
            // List discoveries (Mocking user filter for now, return all or just recent?)
            // In MVP, maybe we pass a userId query param or header?
            // Spec says "anonymous user identifier".

            // For now, scan or query specific GSI if we had userId.
            // Since we don't have Auth/UserId in Table yet (it's in spec but I didn't add GSI for it), 
            // I'll just return empty or recent.
            // Actually, spec says "Discoveries table stores ... user identifier".
            // I'll return a mock list or implementing user filtering if I add userId to table.

            // I'll just list my own discoveries if I passed a userId, or for MVP just list *all* (dev mode).
            // Or maybe client stores IDs and requests them individually?
            // "GET /discoveries: Lists all discovery sessions for the current user."

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify([])
            };
        }

        if (method === 'GET' && path === '/discoveries/{id}') {
            const id = event.pathParameters?.id!; // could be just UUID or full ID? 
            // Client likely sends UUID.
            // My ID format is DISCOVERY#UUID.
            // I'll assume client sends full ID or I prefix it.
            // Let's assume client sends UUID.

            let discoveryPk = id;
            if (!id.startsWith('DISCOVERY#')) {
                discoveryPk = `DISCOVERY#${id}`;
            }

            const result = await ddbDocClient.send(new GetCommand({
                TableName: DISCOVERIES_TABLE,
                Key: { PK: discoveryPk, SK: 'METADATA' }
            }));

            if (!result.Item) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Discovery not found' }) };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Item)
            };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Not Found' }) };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error', error: error instanceof Error ? error.message : String(error) })
        };
    }
};
