import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ddbDocClient } from '../utils/ddb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';
import { Node, NodeCategory, NodeType } from '../types';

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const AI_CACHE_TABLE = process.env.AI_CACHE_TABLE!;
const MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';

export class AIService {

    private computeHash(context: any): string {
        return crypto.createHash('md5').update(JSON.stringify(context)).digest('hex');
    }

    async generateChildren(
        parentNode: Node,
        discoveryPrompt: string,
        existingSiblingIds: string[]
    ): Promise<any[]> {

        // 1. Check Cache
        const context = {
            parentId: parentNode.id,
            parentTitle: parentNode.title,
            parentCategory: parentNode.category,
            discoveryPrompt // Prompt influences context
        };
        const hash = this.computeHash(context);

        // TODO: Precise caching strategy (per child type? or bulk?). 
        // For MVP, letting it be per parent context.

        try {
            const cached = await ddbDocClient.send(new GetCommand({
                TableName: AI_CACHE_TABLE,
                Key: { PK: `CACHE#${hash}`, SK: 'CHILDREN' }
            }));

            if (cached.Item && cached.Item.content) {
                console.log('Cache hit for children generation');
                return cached.Item.content;
            }
        } catch (e) {
            console.warn('Cache read error', e);
        }

        // 2. Generate
        console.log('Cache miss. Generating children...');
        const prompt = this.constructPrompt(parentNode, discoveryPrompt);

        const response = await this.invokeBedrock(prompt);

        // 3. Cache Result
        try {
            await ddbDocClient.send(new PutCommand({
                TableName: AI_CACHE_TABLE,
                Item: {
                    PK: `CACHE#${hash}`,
                    SK: 'CHILDREN',
                    content: response,
                    ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
                }
            }));
        } catch (e) {
            console.warn('Cache write error', e);
        }

        return response;
    }

    private constructPrompt(parentNode: Node, userPrompt: string): string {
        return `
      You are a travel expert.
      User Journey: ${userPrompt}
      Current Location/Context: ${parentNode.title} (${parentNode.category})
      Description: ${JSON.stringify(parentNode.content)}

      Generate 3 to 5 child nodes connected to this current node.
      Mix of categories: Destination, Activity, Accommodation, Food, Culture.
      
      Output JSON array format only:
      [
        {
          "title": "Title",
          "category": "Category",
          "type": "template",
          "content": { ...specific fields... }
        }
      ]
      Ensure valid JSON. Do not include markdown code blocks.
    `;
    }

    private async invokeBedrock(prompt: string): Promise<any> {
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 4096,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        };

        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload)
        });

        try {
            const response = await bedrock.send(command);
            const decodedBody = new TextDecoder().decode(response.body);
            const responseBody = JSON.parse(decodedBody);
            const content = responseBody.content[0].text;

            // Attempt to parse JSON from content
            // Handle potential markdown wrap
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Bedrock invocation failed', error);
            throw error;
        }
    }
}
