#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';


const app = new cdk.App();

const stage = app.node.tryGetContext('stage') || 'dev';
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const prefix = capitalize(stage);

const databaseStack = new DatabaseStack(app, `${prefix}-TravelDiscoveryDatabaseStack`, {});

const frontendStack = new FrontendStack(app, `${prefix}-TravelDiscoveryFrontendStack`, {});

const apiStack = new ApiStack(app, `${prefix}-TravelDiscoveryApiStack`, {
  discoveriesTable: databaseStack.discoveriesTable,
  nodesTable: databaseStack.nodesTable,
  sessionsTable: databaseStack.sessionsTable,
  aiCacheTable: databaseStack.aiCacheTable,
  allowedOrigin: frontendStack.siteUrl,
  apiSecretToken: process.env.API_SECRET_TOKEN || 'local-dev-token',
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
});

