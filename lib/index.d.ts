import * as cdk from '@aws-cdk/core';
import { Table } from "@aws-cdk/aws-dynamodb";
import { TableProps } from "@aws-cdk/aws-dynamodb/lib/table";
import { Domain } from "@aws-cdk/aws-elasticsearch";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
export interface StreamConfig {
    domain: Domain;
    index: string;
}
export interface Props extends TableProps {
    streamTo: StreamConfig;
}
export declare class DynamoDBWithElasticSearchStream extends Table {
    private props;
    streamFunction: NodejsFunction;
    constructor(scope: cdk.Construct, id: string, props: Props);
    private createStreamLambda;
}
