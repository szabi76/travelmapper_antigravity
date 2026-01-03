import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ddbDocClient } from '../utils/ddb';
import { PutCommand, QueryCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Discovery, Node } from '../types';
import { AIService } from '../services/ai-service';

const DISCOVERIES_TABLE = process.env.DISCOVERIES_TABLE!;
const NODES_TABLE = process.env.NODES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.resource;

    // Headers for CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    };

    // Auth Check
    const authHeader = event.headers['Authorization'] || event.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET_TOKEN}`) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

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

            // Create Root Node (Rich Content via AI)
            const aiService = new AIService(); // Instantiate service
            let enrichedData;
            try {
                enrichedData = await aiService.enrichNode(prompt, 'Destination');
            } catch (e) {
                console.error('Enrichment failed, using defaults', e);
                enrichedData = {
                    title: prompt,
                    category: 'Destination',
                    content: { description: `Root node for: ${prompt}` }
                };
            }

            const rootNode: Node = {
                id: rootNodeId,
                discoveryId,
                type: 'template',
                category: enrichedData.category || 'Destination',
                title: enrichedData.title || prompt,
                content: {
                    ...(enrichedData.content || { description: `Root node for: ${prompt}` }),
                    _debugError: enrichedData._debugError
                },
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

            try {
                // Scan for all Discoveries (SK = METADATA)
                // For MVP, Scan is acceptable. For production, GSI by UserID is better.
                const result = await ddbDocClient.send(new ScanCommand({
                    TableName: DISCOVERIES_TABLE,
                    FilterExpression: 'SK = :sk',
                    ExpressionAttributeValues: {
                        ':sk': 'METADATA'
                    }
                }));

                const items = (result.Items || []) as Discovery[];
                // Sort by createdAt desc
                items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(items)
                };
            } catch (e) {
                console.error('Failed to scan', e);
                return { statusCode: 500, headers, body: JSON.stringify({ message: 'Failed to list discoveries' }) };
            }
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
