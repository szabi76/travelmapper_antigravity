import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Node, Discovery } from '../types';
import { AIService } from '../services/ai-service';
import { NodeService } from '../services/node-service';
import { v4 as uuidv4 } from 'uuid';

const aiService = new AIService();
const nodeService = new NodeService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const path = event.resource;
    const idParameter = event.pathParameters?.id;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*', };

    // Auth Check
    const authHeader = event.headers['Authorization'] || event.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET_TOKEN}`) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

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
        const node = await nodeService.getNode(nodeId);

        if (!node) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Node not found' }) };
        }

        if (method === 'GET' && path === '/nodes/{id}') {
            return { statusCode: 200, headers, body: JSON.stringify(node) };
        }

        if (method === 'GET' && path.endsWith('/children')) {
            // If children loaded, fetch and return
            if (node.childrenLoaded) {
                console.log('Children already loaded. Fetching from DB.');
                const children = await nodeService.getChildren(node.discoveryId, node.id);
                return { statusCode: 200, headers, body: JSON.stringify(children) };
            }

            console.log('Generating children...');
            // Need Discovery Prompt
            const discovery = await nodeService.getDiscovery(node.discoveryId);
            if (!discovery) {
                return { statusCode: 404, headers, body: JSON.stringify({ message: 'Discovery not found' }) };
            }

            // Generate
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
            await nodeService.createNodes(newNodes);

            // Update Parent
            await nodeService.setChildrenLoaded(node.id);

            return { statusCode: 200, headers, body: JSON.stringify(newNodes) };
        }

        if (method === 'POST' && path.endsWith('/enrich')) {
            console.log('Enriching node content...');

            // Call AI
            let enrichedData;
            try {
                enrichedData = await aiService.enrichNode(node.title, node.category);
            } catch (e: any) {
                console.error('Enrichment failed', e);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ message: 'Enrichment failed', error: e.message })
                };
            }

            // Update DB
            const updatedContent = {
                ...(enrichedData.content || {}),
                _debugError: enrichedData._debugError // Pass error if any
            };

            const updatedNode = await nodeService.updateNodeContent(node.id, updatedContent);

            // Return updated node
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(updatedNode)
            };
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
