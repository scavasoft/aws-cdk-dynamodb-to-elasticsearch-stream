import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import {DynamoDBWithElasticSearchStream} from "../../../lib";
import {AttributeType} from "@aws-cdk/aws-dynamodb";
import {Domain, ElasticsearchVersion} from "@aws-cdk/aws-elasticsearch";

export class DynamoDbToElasticSearchStreamExample extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const domain = new Domain(this, 'elasticsearch', {
            version: ElasticsearchVersion.V7_7,
            capacity: {
                masterNodeInstanceType: "t3.small.elasticsearch",
                dataNodeInstanceType: "t3.small.elasticsearch",
            },
            useUnsignedBasicAuth: true,
        });

        const index = 'sample-index';

        // The code that defines your stack goes here
        new DynamoDBWithElasticSearchStream(this, 'table', {
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
            streamTo: {
                domain,
                index,
            }
        });

    }
}
