import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
    discoveriesTable: dynamodb.Table;
    nodesTable: dynamodb.Table;
    sessionsTable: dynamodb.Table;
    aiCacheTable: dynamodb.Table;
    allowedOrigin: string;
    apiSecretToken: string;
    mapboxAccessToken: string;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        // Shared environment variables
        const environment = {
            DISCOVERIES_TABLE: props.discoveriesTable.tableName,
            NODES_TABLE: props.nodesTable.tableName,
            SESSIONS_TABLE: props.sessionsTable.tableName,
            AI_CACHE_TABLE: props.aiCacheTable.tableName,
            ALLOWED_ORIGIN: props.allowedOrigin,
            API_SECRET_TOKEN: props.apiSecretToken,
            MAPBOX_ACCESS_TOKEN: props.mapboxAccessToken,
        };

        // Discovery Handler
        const discoveryHandler = new nodejs.NodejsFunction(this, 'DiscoveryHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../src/handlers/discovery-handler.ts'),
            handler: 'handler',
            environment,
            timeout: cdk.Duration.seconds(30),
        });

        // Node Handler
        const nodeHandler = new nodejs.NodejsFunction(this, 'NodeHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../src/handlers/node-handler.ts'),
            handler: 'handler',
            environment,
            timeout: cdk.Duration.seconds(60), // AI generation can take time
        });

        // Session Handler
        const sessionHandler = new nodejs.NodejsFunction(this, 'SessionHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, '../src/handlers/session-handler.ts'),
            handler: 'handler',
            environment,
            timeout: cdk.Duration.seconds(10),
        });

        // Grant permissions
        props.discoveriesTable.grantReadWriteData(discoveryHandler);
        props.nodesTable.grantReadWriteData(discoveryHandler); // Creates root node

        props.nodesTable.grantReadWriteData(nodeHandler);
        props.aiCacheTable.grantReadWriteData(nodeHandler);
        // Node handler might read parent context from discovery/nodes?

        props.sessionsTable.grantReadWriteData(sessionHandler);

        // Grant Bedrock Access for AI
        const bedrockPolicy = new iam.PolicyStatement({
            actions: ['bedrock:InvokeModel'],
            resources: [
                '*',                                                                        // Fallback/Broad access
                'arn:aws:bedrock:::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0', // Global FM (No Region/Account)
            ],
        });
        discoveryHandler.addToRolePolicy(bedrockPolicy);
        nodeHandler.addToRolePolicy(bedrockPolicy);

        // API Gateway
        const api = new apigateway.RestApi(this, 'TravelDiscoveryApi', {
            restApiName: 'Travel Discovery Service',
            defaultCorsPreflightOptions: {
                allowOrigins: [props.allowedOrigin, 'http://localhost:5173'], // Allow Dev + Prod (Make strict in prod later?)
                allowMethods: apigateway.Cors.ALL_METHODS,
            },
        });

        // Resources
        const discoveries = api.root.addResource('discoveries');
        discoveries.addMethod('POST', new apigateway.LambdaIntegration(discoveryHandler));
        discoveries.addMethod('GET', new apigateway.LambdaIntegration(discoveryHandler));

        const discovery = discoveries.addResource('{id}');
        discovery.addMethod('GET', new apigateway.LambdaIntegration(discoveryHandler));

        const nodes = api.root.addResource('nodes');
        const node = nodes.addResource('{id}');
        node.addMethod('GET', new apigateway.LambdaIntegration(nodeHandler));

        const nodeChildren = node.addResource('children');
        nodeChildren.addMethod('GET', new apigateway.LambdaIntegration(nodeHandler));

        const nodeEnrich = node.addResource('enrich');
        nodeEnrich.addMethod('POST', new apigateway.LambdaIntegration(nodeHandler));

        const sessions = api.root.addResource('sessions');
        const session = sessions.addResource('{id}');
        session.addMethod('GET', new apigateway.LambdaIntegration(sessionHandler));
        session.addMethod('PUT', new apigateway.LambdaIntegration(sessionHandler));
    }
}
