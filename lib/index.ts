import * as cdk from '@aws-cdk/core';
import {StreamViewType, Table} from "@aws-cdk/aws-dynamodb";
import {TableProps} from "@aws-cdk/aws-dynamodb/lib/table";
import {Domain} from "@aws-cdk/aws-elasticsearch";
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";
import {Stack} from "@aws-cdk/core";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {StartingPosition} from "@aws-cdk/aws-lambda";
import {DynamoEventSource} from "@aws-cdk/aws-lambda-event-sources";

export interface StreamConfig {
    // ElasticSearch domain where data will be streamed to
    domain: Domain,
    // ElasticSearch index where data will be streamed to
    index: string,
}

export interface Props extends TableProps {
    streamTo: StreamConfig,
}

export class DynamoDBWithElasticSearchStream extends Table {
    public streamFunction: NodejsFunction;

    constructor(scope: cdk.Construct, id: string, private props: Props) {
        super(scope, id, {
            ...props,

            // Enable DynamoDB stream. The Lambda that synchronizes to ES needs it
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
        });

        this.streamFunction = this.createStreamLambda();

        // Attach the Lambda as an event source to the DynamoDB Stream
        this.streamFunction.addEventSource(new DynamoEventSource(this, {
            startingPosition: StartingPosition.TRIM_HORIZON
        }));

        // Allow the Lambda to read and write to ElasticSearch HTTPs endpoints
        this.props.streamTo.domain.grantReadWrite(this.streamFunction);
        if (this.props.streamTo.domain.masterUserPassword) {
            this.streamFunction.addEnvironment('ES_PASSWORD', this.props.streamTo.domain.masterUserPassword.toString());
        }
    }

    private createStreamLambda() {
        return new NodejsFunction(this, 'fn-for-stream', {
            entry: path.resolve(__dirname, './lambda/stream.ts'),
            projectRoot: path.resolve(__dirname, './..'),
            environment: {
                ES_DOMAIN: this.props.streamTo.domain.domainEndpoint,
                ES_INDEX: this.props.streamTo.index,
                PK: this.props.partitionKey.name,
            },
            initialPolicy: [
                // Allow Lambda to read/write to ElasticSearch
                new PolicyStatement({
                    actions: ["es:*"],
                    resources: ["*"],
                })
            ]
        });
    }
}
