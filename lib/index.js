"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBWithElasticSearchStream = void 0;
const aws_dynamodb_1 = require("@aws-cdk/aws-dynamodb");
const aws_lambda_nodejs_1 = require("@aws-cdk/aws-lambda-nodejs");
const path = require("path");
const aws_iam_1 = require("@aws-cdk/aws-iam");
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const aws_lambda_event_sources_1 = require("@aws-cdk/aws-lambda-event-sources");
class DynamoDBWithElasticSearchStream extends aws_dynamodb_1.Table {
    constructor(scope, id, props) {
        super(scope, id, {
            ...props,
            // Enable DynamoDB stream. The Lambda that synchronizes to ES needs it
            stream: aws_dynamodb_1.StreamViewType.NEW_AND_OLD_IMAGES,
        });
        this.props = props;
        this.streamFunction = this.createStreamLambda();
        // Attach the Lambda as an event source to the DynamoDB Stream
        this.streamFunction.addEventSource(new aws_lambda_event_sources_1.DynamoEventSource(this, {
            startingPosition: aws_lambda_1.StartingPosition.TRIM_HORIZON
        }));
        // Allow the Lambda to read and write to ElasticSearch HTTPs endpoints
        this.props.streamTo.domain.grantReadWrite(this.streamFunction);
        if (this.props.streamTo.domain.masterUserPassword) {
            this.streamFunction.addEnvironment('ES_PASSWORD', this.props.streamTo.domain.masterUserPassword.toString());
        }
    }
    createStreamLambda() {
        return new aws_lambda_nodejs_1.NodejsFunction(this, 'fn-for-stream', {
            entry: path.resolve(__dirname, './lambda/stream.ts'),
            projectRoot: path.resolve(__dirname, './..'),
            environment: {
                ES_DOMAIN: this.props.streamTo.domain.domainEndpoint,
                ES_INDEX: this.props.streamTo.index,
                PK: this.props.partitionKey.name,
            },
            initialPolicy: [
                // Allow Lambda to read/write to ElasticSearch
                new aws_iam_1.PolicyStatement({
                    actions: ["es:*"],
                    resources: ["*"],
                })
            ]
        });
    }
}
exports.DynamoDBWithElasticSearchStream = DynamoDBWithElasticSearchStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3REFBNEQ7QUFHNUQsa0VBQTBEO0FBQzFELDZCQUE2QjtBQUU3Qiw4Q0FBaUQ7QUFDakQsb0RBQXFEO0FBQ3JELGdGQUFvRTtBQWFwRSxNQUFhLCtCQUFnQyxTQUFRLG9CQUFLO0lBR3RELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQVUsS0FBWTtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRTtZQUNiLEdBQUcsS0FBSztZQUVSLHNFQUFzRTtZQUN0RSxNQUFNLEVBQUUsNkJBQWMsQ0FBQyxrQkFBa0I7U0FDNUMsQ0FBQyxDQUFDO1FBTitDLFVBQUssR0FBTCxLQUFLLENBQU87UUFROUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVoRCw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSw0Q0FBaUIsQ0FBQyxJQUFJLEVBQUU7WUFDM0QsZ0JBQWdCLEVBQUUsNkJBQWdCLENBQUMsWUFBWTtTQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVKLHNFQUFzRTtRQUN0RSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMvRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRTtZQUMvQyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDL0c7SUFDTCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3RCLE9BQU8sSUFBSSxrQ0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDN0MsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDO1lBQ3BELFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7WUFDNUMsV0FBVyxFQUFFO2dCQUNULFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYztnQkFDcEQsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUs7Z0JBQ25DLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJO2FBQ25DO1lBQ0QsYUFBYSxFQUFFO2dCQUNYLDhDQUE4QztnQkFDOUMsSUFBSSx5QkFBZSxDQUFDO29CQUNoQixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7b0JBQ2pCLFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztpQkFDbkIsQ0FBQzthQUNMO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBM0NELDBFQTJDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCB7U3RyZWFtVmlld1R5cGUsIFRhYmxlfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQge1RhYmxlUHJvcHN9IGZyb20gXCJAYXdzLWNkay9hd3MtZHluYW1vZGIvbGliL3RhYmxlXCI7XG5pbXBvcnQge0RvbWFpbn0gZnJvbSBcIkBhd3MtY2RrL2F3cy1lbGFzdGljc2VhcmNoXCI7XG5pbXBvcnQge05vZGVqc0Z1bmN0aW9ufSBmcm9tIFwiQGF3cy1jZGsvYXdzLWxhbWJkYS1ub2RlanNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7U3RhY2t9IGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQge1BvbGljeVN0YXRlbWVudH0gZnJvbSBcIkBhd3MtY2RrL2F3cy1pYW1cIjtcbmltcG9ydCB7U3RhcnRpbmdQb3NpdGlvbn0gZnJvbSBcIkBhd3MtY2RrL2F3cy1sYW1iZGFcIjtcbmltcG9ydCB7RHluYW1vRXZlbnRTb3VyY2V9IGZyb20gXCJAYXdzLWNkay9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1Db25maWcge1xuICAgIC8vIEVsYXN0aWNTZWFyY2ggZG9tYWluIHdoZXJlIGRhdGEgd2lsbCBiZSBzdHJlYW1lZCB0b1xuICAgIGRvbWFpbjogRG9tYWluLFxuICAgIC8vIEVsYXN0aWNTZWFyY2ggaW5kZXggd2hlcmUgZGF0YSB3aWxsIGJlIHN0cmVhbWVkIHRvXG4gICAgaW5kZXg6IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9wcyBleHRlbmRzIFRhYmxlUHJvcHMge1xuICAgIHN0cmVhbVRvOiBTdHJlYW1Db25maWcsXG59XG5cbmV4cG9ydCBjbGFzcyBEeW5hbW9EQldpdGhFbGFzdGljU2VhcmNoU3RyZWFtIGV4dGVuZHMgVGFibGUge1xuICAgIHB1YmxpYyBzdHJlYW1GdW5jdGlvbjogTm9kZWpzRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJpdmF0ZSBwcm9wczogUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCB7XG4gICAgICAgICAgICAuLi5wcm9wcyxcblxuICAgICAgICAgICAgLy8gRW5hYmxlIER5bmFtb0RCIHN0cmVhbS4gVGhlIExhbWJkYSB0aGF0IHN5bmNocm9uaXplcyB0byBFUyBuZWVkcyBpdFxuICAgICAgICAgICAgc3RyZWFtOiBTdHJlYW1WaWV3VHlwZS5ORVdfQU5EX09MRF9JTUFHRVMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3RyZWFtRnVuY3Rpb24gPSB0aGlzLmNyZWF0ZVN0cmVhbUxhbWJkYSgpO1xuXG4gICAgICAgIC8vIEF0dGFjaCB0aGUgTGFtYmRhIGFzIGFuIGV2ZW50IHNvdXJjZSB0byB0aGUgRHluYW1vREIgU3RyZWFtXG4gICAgICAgIHRoaXMuc3RyZWFtRnVuY3Rpb24uYWRkRXZlbnRTb3VyY2UobmV3IER5bmFtb0V2ZW50U291cmNlKHRoaXMsIHtcbiAgICAgICAgICAgIHN0YXJ0aW5nUG9zaXRpb246IFN0YXJ0aW5nUG9zaXRpb24uVFJJTV9IT1JJWk9OXG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBBbGxvdyB0aGUgTGFtYmRhIHRvIHJlYWQgYW5kIHdyaXRlIHRvIEVsYXN0aWNTZWFyY2ggSFRUUHMgZW5kcG9pbnRzXG4gICAgICAgIHRoaXMucHJvcHMuc3RyZWFtVG8uZG9tYWluLmdyYW50UmVhZFdyaXRlKHRoaXMuc3RyZWFtRnVuY3Rpb24pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdHJlYW1Uby5kb21haW4ubWFzdGVyVXNlclBhc3N3b3JkKSB7XG4gICAgICAgICAgICB0aGlzLnN0cmVhbUZ1bmN0aW9uLmFkZEVudmlyb25tZW50KCdFU19QQVNTV09SRCcsIHRoaXMucHJvcHMuc3RyZWFtVG8uZG9tYWluLm1hc3RlclVzZXJQYXNzd29yZC50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU3RyZWFtTGFtYmRhKCkge1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdmbi1mb3Itc3RyZWFtJywge1xuICAgICAgICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2xhbWJkYS9zdHJlYW0udHMnKSxcbiAgICAgICAgICAgIHByb2plY3RSb290OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi8uLicpLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBFU19ET01BSU46IHRoaXMucHJvcHMuc3RyZWFtVG8uZG9tYWluLmRvbWFpbkVuZHBvaW50LFxuICAgICAgICAgICAgICAgIEVTX0lOREVYOiB0aGlzLnByb3BzLnN0cmVhbVRvLmluZGV4LFxuICAgICAgICAgICAgICAgIFBLOiB0aGlzLnByb3BzLnBhcnRpdGlvbktleS5uYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluaXRpYWxQb2xpY3k6IFtcbiAgICAgICAgICAgICAgICAvLyBBbGxvdyBMYW1iZGEgdG8gcmVhZC93cml0ZSB0byBFbGFzdGljU2VhcmNoXG4gICAgICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcImVzOipcIl0sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=