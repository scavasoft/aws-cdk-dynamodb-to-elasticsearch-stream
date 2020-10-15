import {DynamoDBStreamEvent} from "aws-lambda";
import {DynamoDB} from "aws-sdk";

const {Client} = require('@elastic/elasticsearch')

export const handler = async (event: DynamoDBStreamEvent) => {
    const node = process.env.ES_DOMAIN as string;
    const index = process.env.ES_INDEX as string;

    console.log("DynamoDB to ES synchronize event triggered");
    console.log("Received event object:", event);
    console.log("ES domain to use:", node);
    console.log("ES index to use:", index);

    if (!event["Records"]) {
        console.log("No records to process. Exiting");
        return;
    }

    const auth = process.env.ES_PASSWORD ? {
        username: 'admin',
        password: process.env.ES_PASSWORD,
    } : undefined;

    const client = new Client({
        node: `https://${node}`,
        auth,
    });

    for (const record of event
        .Records
        .filter((record: any) => record.dynamodb)) {
        try {
            let result;

            const keys = record.dynamodb!.Keys;

            console.log(JSON.stringify(record));

            const id = keys?.[process.env.PK!].S;

            if (!id) {
                console.log(`Can not detect the ID of the document to index. Make sure the DynamoDB document has a field called '${process.env.PK}'`);
                continue;
            }

            if (record.eventName === "REMOVE") {
                console.log("Deleting document: " + id);
                result = await client.delete({
                    index,
                    id,
                });
            } else {
                if (!record.dynamodb!.NewImage) {
                    console.log("Trying to index new document but the DynamoDB stream event did not provide the NewImage. Skipping...");
                    continue;
                }

                console.log("Indexing document: " + id);
                const convertedDocument = DynamoDB.Converter.output({"M": record.dynamodb!.NewImage});
                console.log("The full object to store is: ", convertedDocument);
                result = await client.index({
                    index,
                    id,
                    body: convertedDocument,
                })
            }

            console.log(result);
        } catch (e) {
            console.error("Failed to process DynamoDB row");
            console.error(record);
            console.error(e);
        }

    }
};
