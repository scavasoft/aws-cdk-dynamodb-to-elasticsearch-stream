#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {DynamoDbToElasticSearchStreamExample} from '../lib/dynamo-db-to-elastic-search-stream-example';

const app = new cdk.App();
new DynamoDbToElasticSearchStreamExample(app, 'DynamoDbToElasticSearchStreamExample');
