#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';


const app = new cdk.App();

const stage = app.node.tryGetContext('stage') || 'dev';
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const prefix = capitalize(stage);

const databaseStack = new DatabaseStack(app, `${prefix}-TravelDiscoveryDatabaseStack`, {});

new ApiStack(app, `${prefix}-TravelDiscoveryApiStack`, {
  discoveriesTable: databaseStack.discoveriesTable,
  nodesTable: databaseStack.nodesTable,
  sessionsTable: databaseStack.sessionsTable,
  aiCacheTable: databaseStack.aiCacheTable,
});

