# Stream DynamoDB to ElasticSearch

AWS CDK based construct that enables you to easily stream data from a DynamoDB table to an ElasticSearch index.

#### Installation

    npm install scavasoft/aws-cdk-dynamodb-to-elasticsearch-stream

### Sample usage

Use the construct as a "drop-in" replacement of the dynamodb.Table construct.

Before:
```typescript
import * as dynamodb from '@aws-cdk/aws-dynamodb';

new dynamodb.Table(this, 'table', {
    partitionKey: {
        name: "id",
        type: AttributeType.STRING,
    },
});
```
After:
```typescript
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';

new DynamoDBWithElasticSearchStream(this, 'table', {
    partitionKey: {
        name: "id",
        type: AttributeType.STRING,
    },
    streamTo: {
        domain: new elasticsearch.Domain(this, 'elasticsearch', {
            version: ElasticsearchVersion.V7_7,
        }),
        index: "some-elasticsearch-index",
    }
});
```

A more in-depth example is available in the /examples subfolder.