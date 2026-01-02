import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
    public readonly bucketName: string;
    public readonly distributionId: string;
    public readonly siteUrl: string;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. S3 Bucket for storing React app compilation output
        const siteBucket = new s3.Bucket(this, 'TravelDiscoveryFrontendBucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html', // SPA routing
            publicReadAccess: false, // Security: CloudFront only
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For MVP/Dev only
            autoDeleteObjects: true, // For MVP/Dev only
        });

        // 2. CloudFront Origin Access Identity (to allow CloudFront to read from private Bucket)
        const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
        siteBucket.grantRead(oai);

        // 3. CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'TravelDiscoveryDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(siteBucket, { originAccessIdentity: oai }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                compress: true,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html', // Handle SPA routing for direct links
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        // 4. Exports (to be used by CI/CD)
        this.bucketName = siteBucket.bucketName;
        this.distributionId = distribution.distributionId;
        this.siteUrl = `https://${distribution.distributionDomainName}`;

        new cdk.CfnOutput(this, 'FrontendBucketName', {
            value: siteBucket.bucketName,
            description: 'S3 Bucket for Frontend Assets',
        });

        new cdk.CfnOutput(this, 'FrontendDistributionId', {
            value: distribution.distributionId,
            description: 'CloudFront Distribution ID',
        });

        new cdk.CfnOutput(this, 'FrontendUrl', {
            value: this.siteUrl,
            description: 'URL of the deployed frontend',
        });
    }
}
