import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ddbDocClient } from '../utils/ddb';
import { GetCommand, UpdateCommand, QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Node, Discovery } from '../types';
import { AIService } from '../services/ai-service';
import { v4 as uuidv4 } from 'uuid';

const NODES_TABLE = process.env.NODES_TABLE!;
const DISCOVERIES_TABLE = process.env.DISCOVERIES_TABLE!;
const aiService = new AIService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.resource;
    const idParameter = event.pathParameters?.id;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    console.log(`${method} ${path}`, idParameter);

    try {
        if (!idParameter) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };
        }

        // Normalize ID
        let nodeId = idParameter;
        if (!nodeId.startsWith('NODE#')) {
            nodeId = `NODE#${nodeId}`;
        }

        // 1. Fetch Node
        const nodeResult = await ddbDocClient.send(new GetCommand({
            TableName: NODES_TABLE,
            Key: { PK: nodeId, SK: 'METADATA' }
        }));

        if (!nodeResult.Item) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Node not found' }) };
        }
        const node = nodeResult.Item as Node;

        if (method === 'GET' && path === '/nodes/{id}') {
            return { statusCode: 200, headers, body: JSON.stringify(node) };
        }

        if (method === 'GET' && path.endsWith('/children')) {
            // If children loaded, fetch and return
            if (node.childrenLoaded) {
                console.log('Children already loaded. Fetching from DB.');
                const children = await fetchChildren(node.discoveryId, node.id);
                return { statusCode: 200, headers, body: JSON.stringify(children) };
            }

            console.log('Generating children...');
            // Need Discovery Prompt
            const discoveryResult = await ddbDocClient.send(new GetCommand({
                TableName: DISCOVERIES_TABLE,
                Key: { PK: node.discoveryId, SK: 'METADATA' }
            }));
            const discovery = discoveryResult.Item as Discovery;

            // Generate
            // Find existing siblings? For now passing empty or fetching parent's siblings if needed.
            // Assuming no strict sibling check for MVP apart from generating.

            const generatedItems = await aiService.generateChildren(node, discovery.prompt, []);

            // Map to Node objects
            const newNodes: Node[] = generatedItems.map((item: any) => ({
                id: `NODE#${uuidv4()}`,
                discoveryId: node.discoveryId,
                parentNodeId: node.id,
                type: item.type || 'template',
                category: item.category,
                title: item.title,
                content: item, // Store full item as content or normalized
                childrenLoaded: false,
                createdAt: new Date().toISOString()
            }));

            // Write to DB
            // BatchWrite only supports 25 requests. We expect 3-5.
            const putRequests = newNodes.map(n => ({
                PutRequest: {
                    Item: {
                        PK: n.id,
                        SK: 'METADATA',
                        ...n
                    }
                }
            }));

            if (putRequests.length > 0) {
                await ddbDocClient.send(new BatchWriteCommand({
                    RequestItems: {
                        [NODES_TABLE]: putRequests
                    }
                }));
            }

            // Update Parent
            await ddbDocClient.send(new UpdateCommand({
                TableName: NODES_TABLE,
                Key: { PK: node.id, SK: 'METADATA' },
                UpdateExpression: 'set childrenLoaded = :t',
                ExpressionAttributeValues: { ':t': true }
            }));

            return { statusCode: 200, headers, body: JSON.stringify(newNodes) };
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

async function fetchChildren(discoveryId: string, parentNodeId: string): Promise<Node[]> {
    // Query by DiscoveryId GSI
    const result = await ddbDocClient.send(new QueryCommand({
        TableName: NODES_TABLE,
        IndexName: 'DiscoveryIndex',
        KeyConditionExpression: 'discoveryId = :did',
        ExpressionAttributeValues: { ':did': discoveryId }
    }));

    // Filter in memory for parentNodeId
    const nodes = (result.Items || []) as Node[];
    return nodes.filter(n => n.parentNodeId === parentNodeId);
}
