
import { ddbDocClient } from '../utils/ddb';
import { GetCommand, UpdateCommand, QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Node, Discovery } from '../types';

const NODES_TABLE = process.env.NODES_TABLE!;
const DISCOVERIES_TABLE = process.env.DISCOVERIES_TABLE!;

export class NodeService {

    async getNode(id: string): Promise<Node | null> {
        const result = await ddbDocClient.send(new GetCommand({
            TableName: NODES_TABLE,
            Key: { PK: id, SK: 'METADATA' }
        }));
        return (result.Item as Node) || null;
    }

    async getDiscovery(id: string): Promise<Discovery | null> {
        const result = await ddbDocClient.send(new GetCommand({
            TableName: DISCOVERIES_TABLE,
            Key: { PK: id, SK: 'METADATA' }
        }));
        return (result.Item as Discovery) || null;
    }

    async getChildren(discoveryId: string, parentNodeId: string): Promise<Node[]> {
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

    async createNodes(nodes: Node[]): Promise<void> {
        // BatchWrite only supports 25 requests. We expect small batches here.
        if (nodes.length === 0) return;

        const putRequests = nodes.map(n => ({
            PutRequest: {
                Item: {
                    PK: n.id,
                    SK: 'METADATA',
                    ...n
                }
            }
        }));

        await ddbDocClient.send(new BatchWriteCommand({
            RequestItems: {
                [NODES_TABLE]: putRequests
            }
        }));
    }

    async setChildrenLoaded(nodeId: string): Promise<void> {
        await ddbDocClient.send(new UpdateCommand({
            TableName: NODES_TABLE,
            Key: { PK: nodeId, SK: 'METADATA' },
            UpdateExpression: 'set childrenLoaded = :t',
            ExpressionAttributeValues: { ':t': true }
        }));
    }

    async updateNodeContent(nodeId: string, content: any): Promise<Node> {
        await ddbDocClient.send(new UpdateCommand({
            TableName: NODES_TABLE,
            Key: { PK: nodeId, SK: 'METADATA' },
            UpdateExpression: 'set content = :c',
            ExpressionAttributeValues: { ':c': content }
        }));

        // Fetch to return full object or construct? 
        // For efficiency, we just assume caller has old state + new content, 
        // but let's re-fetch to be safe (or return void).
        // Let's re-fetch to adhere to the existing handler pattern returning updated node.
        const updated = await this.getNode(nodeId);
        if (!updated) throw new Error('Failed to fetch updated node');
        return updated;
    }
}
