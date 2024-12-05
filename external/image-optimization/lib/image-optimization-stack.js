"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageOptimizationStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const origin_shield_1 = require("./origin-shield");
// Stack Parameters
// related to architecture. If set to false, transformed images are not stored in S3, and all image requests land on Lambda
var STORE_TRANSFORMED_IMAGES = 'true';
// Parameters of S3 bucket where original images are stored
var S3_IMAGE_BUCKET_NAME;
// CloudFront parameters
var CLOUDFRONT_ORIGIN_SHIELD_REGION = (0, origin_shield_1.getOriginShieldRegion)(process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1');
var CLOUDFRONT_CORS_ENABLED = 'true';
// Parameters of transformed images
var S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION = '90';
var S3_TRANSFORMED_IMAGE_CACHE_TTL = 'max-age=31622400';
// Max image size in bytes. If generated images are stored on S3, bigger images are generated, stored on S3
// and request is redirect to the generated image. Otherwise, an application error is sent.
var MAX_IMAGE_SIZE = '4700000';
// Lambda Parameters
var LAMBDA_MEMORY = '1500';
var LAMBDA_TIMEOUT = '60';
// Whether to deploy a sample website referenced in https://aws.amazon.com/blogs/networking-and-content-delivery/image-optimization-using-amazon-cloudfront-and-aws-lambda/
var DEPLOY_SAMPLE_WEBSITE = 'false';
class ImageOptimizationStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        var _a;
        super(scope, id, props);
        // Change stack parameters based on provided context
        STORE_TRANSFORMED_IMAGES =
            this.node.tryGetContext('STORE_TRANSFORMED_IMAGES') || STORE_TRANSFORMED_IMAGES;
        S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION =
            this.node.tryGetContext('S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION') ||
                S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION;
        S3_TRANSFORMED_IMAGE_CACHE_TTL =
            this.node.tryGetContext('S3_TRANSFORMED_IMAGE_CACHE_TTL') ||
                S3_TRANSFORMED_IMAGE_CACHE_TTL;
        S3_IMAGE_BUCKET_NAME =
            this.node.tryGetContext('S3_IMAGE_BUCKET_NAME') || S3_IMAGE_BUCKET_NAME;
        CLOUDFRONT_ORIGIN_SHIELD_REGION =
            this.node.tryGetContext('CLOUDFRONT_ORIGIN_SHIELD_REGION') ||
                CLOUDFRONT_ORIGIN_SHIELD_REGION;
        CLOUDFRONT_CORS_ENABLED =
            this.node.tryGetContext('CLOUDFRONT_CORS_ENABLED') || CLOUDFRONT_CORS_ENABLED;
        LAMBDA_MEMORY = this.node.tryGetContext('LAMBDA_MEMORY') || LAMBDA_MEMORY;
        LAMBDA_TIMEOUT = this.node.tryGetContext('LAMBDA_TIMEOUT') || LAMBDA_TIMEOUT;
        MAX_IMAGE_SIZE = this.node.tryGetContext('MAX_IMAGE_SIZE') || MAX_IMAGE_SIZE;
        DEPLOY_SAMPLE_WEBSITE =
            this.node.tryGetContext('DEPLOY_SAMPLE_WEBSITE') || DEPLOY_SAMPLE_WEBSITE;
        // deploy a sample website for testing if required
        if (DEPLOY_SAMPLE_WEBSITE === 'true') {
            var sampleWebsiteBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 's3-sample-website-bucket', {
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
                blockPublicAccess: aws_cdk_lib_1.aws_s3.BlockPublicAccess.BLOCK_ALL,
                encryption: aws_cdk_lib_1.aws_s3.BucketEncryption.S3_MANAGED,
                enforceSSL: true,
                autoDeleteObjects: true,
            });
            var sampleWebsiteDelivery = new aws_cdk_lib_1.aws_cloudfront.Distribution(this, 'websiteDeliveryDistribution', {
                comment: 'image optimization - sample website',
                defaultRootObject: 'index.html',
                defaultBehavior: {
                    origin: new aws_cdk_lib_1.aws_cloudfront_origins.S3Origin(sampleWebsiteBucket),
                    viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                },
            });
            new aws_cdk_lib_1.CfnOutput(this, 'SampleWebsiteDomain', {
                description: 'Sample website domain',
                value: sampleWebsiteDelivery.distributionDomainName,
            });
            new aws_cdk_lib_1.CfnOutput(this, 'SampleWebsiteS3Bucket', {
                description: 'S3 bucket use by the sample website',
                value: sampleWebsiteBucket.bucketName,
            });
        }
        // For the bucket having original images, either use an external one, or create one with some samples photos.
        var originalImageBucket;
        var transformedImageBucket;
        if (S3_IMAGE_BUCKET_NAME) {
            originalImageBucket = aws_cdk_lib_1.aws_s3.Bucket.fromBucketName(this, 'imported-original-image-bucket', S3_IMAGE_BUCKET_NAME);
            new aws_cdk_lib_1.CfnOutput(this, 'OriginalImagesS3Bucket', {
                description: 'S3 bucket where original images are stored',
                value: originalImageBucket.bucketName,
            });
        }
        else {
            originalImageBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 's3-sample-original-image-bucket', {
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
                blockPublicAccess: aws_cdk_lib_1.aws_s3.BlockPublicAccess.BLOCK_ALL,
                encryption: aws_cdk_lib_1.aws_s3.BucketEncryption.S3_MANAGED,
                enforceSSL: true,
                autoDeleteObjects: true,
            });
            new aws_cdk_lib_1.aws_s3_deployment.BucketDeployment(this, 'DeployWebsite', {
                sources: [aws_cdk_lib_1.aws_s3_deployment.Source.asset('./image-sample')],
                destinationBucket: originalImageBucket,
                destinationKeyPrefix: 'images/rio/',
            });
            new aws_cdk_lib_1.CfnOutput(this, 'OriginalImagesS3Bucket', {
                description: 'S3 bucket where original images are stored',
                value: originalImageBucket.bucketName,
            });
        }
        // create bucket for transformed images if enabled in the architecture
        if (STORE_TRANSFORMED_IMAGES === 'true') {
            transformedImageBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 's3-transformed-image-bucket', {
                removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
                autoDeleteObjects: true,
                lifecycleRules: [
                    {
                        expiration: aws_cdk_lib_1.Duration.days(parseInt(S3_TRANSFORMED_IMAGE_EXPIRATION_DURATION)),
                    },
                ],
            });
        }
        // prepare env variable for Lambda
        var lambdaEnv = {
            originalImageBucketName: originalImageBucket.bucketName,
            transformedImageCacheTTL: S3_TRANSFORMED_IMAGE_CACHE_TTL,
            maxImageSize: MAX_IMAGE_SIZE,
        };
        if (transformedImageBucket)
            lambdaEnv.transformedImageBucketName = transformedImageBucket.bucketName;
        // IAM policy to read from the S3 bucket containing the original images
        const s3ReadOriginalImagesPolicy = new aws_cdk_lib_1.aws_iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: ['arn:aws:s3:::' + originalImageBucket.bucketName + '/*'],
        });
        // statements of the IAM policy to attach to Lambda
        var iamPolicyStatements = [s3ReadOriginalImagesPolicy];
        // Create Lambda for image processing
        var lambdaProps = {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('functions/image-processing'),
            timeout: aws_cdk_lib_1.Duration.seconds(parseInt(LAMBDA_TIMEOUT)),
            memorySize: parseInt(LAMBDA_MEMORY),
            environment: lambdaEnv,
            logRetention: aws_cdk_lib_1.aws_logs.RetentionDays.ONE_DAY,
        };
        var imageProcessing = new aws_cdk_lib_1.aws_lambda.Function(this, 'image-optimization', lambdaProps);
        // Enable Lambda URL
        const imageProcessingURL = imageProcessing.addFunctionUrl();
        // Leverage CDK Intrinsics to get the hostname of the Lambda URL
        const imageProcessingDomainName = aws_cdk_lib_1.Fn.parseDomainName(imageProcessingURL.url);
        // Create a CloudFront origin: S3 with fallback to Lambda when image needs to be transformed, otherwise with Lambda as sole origin
        var imageOrigin;
        if (transformedImageBucket) {
            imageOrigin = new aws_cdk_lib_1.aws_cloudfront_origins.OriginGroup({
                primaryOrigin: new aws_cdk_lib_1.aws_cloudfront_origins.S3Origin(transformedImageBucket, {
                    originShieldRegion: CLOUDFRONT_ORIGIN_SHIELD_REGION,
                }),
                fallbackOrigin: new aws_cdk_lib_1.aws_cloudfront_origins.HttpOrigin(imageProcessingDomainName, {
                    originShieldRegion: CLOUDFRONT_ORIGIN_SHIELD_REGION,
                }),
                fallbackStatusCodes: [403, 500, 503, 504],
            });
            // write policy for Lambda on the s3 bucket for transformed images
            var s3WriteTransformedImagesPolicy = new aws_cdk_lib_1.aws_iam.PolicyStatement({
                actions: ['s3:PutObject'],
                resources: ['arn:aws:s3:::' + transformedImageBucket.bucketName + '/*'],
            });
            iamPolicyStatements.push(s3WriteTransformedImagesPolicy);
        }
        else {
            imageOrigin = new aws_cdk_lib_1.aws_cloudfront_origins.HttpOrigin(imageProcessingDomainName, {
                originShieldRegion: CLOUDFRONT_ORIGIN_SHIELD_REGION,
            });
        }
        // attach iam policy to the role assumed by Lambda
        (_a = imageProcessing.role) === null || _a === void 0 ? void 0 : _a.attachInlinePolicy(new aws_cdk_lib_1.aws_iam.Policy(this, 'read-write-bucket-policy', {
            statements: iamPolicyStatements,
        }));
        // Create a CloudFront Function for url rewrites
        const urlRewriteFunction = new aws_cdk_lib_1.aws_cloudfront.Function(this, 'urlRewrite', {
            code: aws_cdk_lib_1.aws_cloudfront.FunctionCode.fromFile({
                filePath: 'functions/url-rewrite/index.js',
            }),
            functionName: `urlRewriteFunction${this.node.addr}`,
        });
        var imageDeliveryCacheBehaviorConfig = {
            origin: imageOrigin,
            viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachePolicy: new aws_cdk_lib_1.aws_cloudfront.CachePolicy(this, `ImageCachePolicy${this.node.addr}`, {
                defaultTtl: aws_cdk_lib_1.Duration.hours(24),
                maxTtl: aws_cdk_lib_1.Duration.days(365),
                minTtl: aws_cdk_lib_1.Duration.seconds(0),
                queryStringBehavior: aws_cdk_lib_1.aws_cloudfront.CacheQueryStringBehavior.all(),
            }),
            functionAssociations: [
                {
                    eventType: aws_cdk_lib_1.aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
                    function: urlRewriteFunction,
                },
            ],
        };
        if (CLOUDFRONT_CORS_ENABLED === 'true') {
            // Creating a custom response headers policy. CORS allowed for all origins.
            const imageResponseHeadersPolicy = new aws_cdk_lib_1.aws_cloudfront.ResponseHeadersPolicy(this, `ResponseHeadersPolicy${this.node.addr}`, {
                responseHeadersPolicyName: `ImageResponsePolicy${this.node.addr}`,
                corsBehavior: {
                    accessControlAllowCredentials: false,
                    accessControlAllowHeaders: ['*'],
                    accessControlAllowMethods: ['GET'],
                    accessControlAllowOrigins: ['*'],
                    accessControlMaxAge: aws_cdk_lib_1.Duration.seconds(600),
                    originOverride: false,
                },
                // recognizing image requests that were processed by this solution
                customHeadersBehavior: {
                    customHeaders: [
                        { header: 'x-aws-image-optimization', value: 'v1.0', override: true },
                        { header: 'vary', value: 'accept', override: true },
                    ],
                },
            });
            imageDeliveryCacheBehaviorConfig.responseHeadersPolicy = imageResponseHeadersPolicy;
        }
        const imageDelivery = new aws_cdk_lib_1.aws_cloudfront.Distribution(this, 'imageDeliveryDistribution', {
            comment: 'image optimization - image delivery',
            defaultBehavior: imageDeliveryCacheBehaviorConfig,
        });
        // ADD OAC between CloudFront and LambdaURL
        const oac = new aws_cdk_lib_1.aws_cloudfront.CfnOriginAccessControl(this, 'OAC', {
            originAccessControlConfig: {
                name: `oac${this.node.addr}`,
                originAccessControlOriginType: 'lambda',
                signingBehavior: 'always',
                signingProtocol: 'sigv4',
            },
        });
        const cfnImageDelivery = imageDelivery.node.defaultChild;
        cfnImageDelivery.addPropertyOverride(`DistributionConfig.Origins.${STORE_TRANSFORMED_IMAGES === 'true' ? '1' : '0'}.OriginAccessControlId`, oac.getAtt('Id'));
        imageProcessing.addPermission('AllowCloudFrontServicePrincipal', {
            principal: new aws_cdk_lib_1.aws_iam.ServicePrincipal('cloudfront.amazonaws.com'),
            action: 'lambda:InvokeFunctionUrl',
            sourceArn: `arn:aws:cloudfront::${this.account}:distribution/${imageDelivery.distributionId}`,
        });
        new aws_cdk_lib_1.CfnOutput(this, 'ImageDeliveryDomain', {
            description: 'Domain name of image delivery',
            value: imageDelivery.distributionDomainName,
        });
    }
}
exports.ImageOptimizationStack = ImageOptimizationStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utb3B0aW1pemF0aW9uLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2Utb3B0aW1pemF0aW9uLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxRUFBcUU7QUFDckUsaUNBQWlDOzs7QUFHakMsNkNBY3FCO0FBSXJCLG1EQUF3RDtBQUV4RCxtQkFBbUI7QUFFbkIsMkhBQTJIO0FBQzNILElBQUksd0JBQXdCLEdBQUcsTUFBTSxDQUFDO0FBQ3RDLDJEQUEyRDtBQUMzRCxJQUFJLG9CQUE0QixDQUFDO0FBQ2pDLHdCQUF3QjtBQUN4QixJQUFJLCtCQUErQixHQUFHLElBQUEscUNBQXFCLEVBQzFELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksV0FBVyxDQUN2RSxDQUFDO0FBQ0YsSUFBSSx1QkFBdUIsR0FBRyxNQUFNLENBQUM7QUFDckMsbUNBQW1DO0FBQ25DLElBQUksd0NBQXdDLEdBQUcsSUFBSSxDQUFDO0FBQ3BELElBQUksOEJBQThCLEdBQUcsa0JBQWtCLENBQUM7QUFDeEQsMkdBQTJHO0FBQzNHLDJGQUEyRjtBQUMzRixJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUM7QUFDL0Isb0JBQW9CO0FBQ3BCLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQztBQUMzQixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDMUIsMktBQTJLO0FBQzNLLElBQUkscUJBQXFCLEdBQUcsT0FBTyxDQUFDO0FBaUJwQyxNQUFhLHNCQUF1QixTQUFRLG1CQUFLO0lBQ2hELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7O1FBQzNELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLG9EQUFvRDtRQUNwRCx3QkFBd0I7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsSUFB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QUFFLFFBQVE7Z0JBQ3pCLGVBQWUsRUFBRSxPQUFPO2FBQ3hCO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQStCLENBQUM7UUFDNUUsZ0JBQWdCLENBQUMsbUJBQW1CLENBQ25DLDhCQUE4Qix3QkFBd0IsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyx3QkFBd0IsRUFDckcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDaEIsQ0FBQztRQUVGLGVBQWUsQ0FBQyxhQUFhLENBQUMsaUNBQWlDLEVBQUU7WUFDaEUsU0FBUyxFQUFFLElBQUkscUJBQUcsQ0FBQyxnQkFBZ0IsQ0FBQywwQkFBMEIsQ0FBQztZQUMvRCxNQUFNLEVBQUUsMEJBQTBCO1lBQ2xDLFNBQVMsRUFBRSx1QkFBdUIsSUFBSSxDQUFDLE9BQU8saUJBQWlCLGFBQWEsQ0FBQyxjQUFjLEVBQUU7U0FDN0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUMxQyxXQUFXLEVBQUUsK0JBQStCO1lBQzVDLEtBQUssRUFBRSxhQUFhLENBQUMsc0JBQXNCO1NBQzNDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQWpRRCx3REFpUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVQtMFxuXG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJztcbmltcG9ydCB7XG5cdENmbk91dHB1dCxcblx0YXdzX2Nsb3VkZnJvbnQgYXMgY2xvdWRmcm9udCxcblx0RHVyYXRpb24sXG5cdEZuLFxuXHRhd3NfaWFtIGFzIGlhbSxcblx0YXdzX2xhbWJkYSBhcyBsYW1iZGEsXG5cdGF3c19sb2dzIGFzIGxvZ3MsXG5cdGF3c19jbG91ZGZyb250X29yaWdpbnMgYXMgb3JpZ2lucyxcblx0UmVtb3ZhbFBvbGljeSxcblx0YXdzX3MzIGFzIHMzLFxuXHRhd3NfczNfZGVwbG95bWVudCBhcyBzM2RlcGxveSxcblx0U3RhY2ssXG5cdFN0YWNrUHJvcHMsXG59IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENmbkRpc3RyaWJ1dGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5TaGllbGRSZWdpb24gfSBmcm9tICcuL29yaWdpbi1zaGllbGQnO1xuXG4vLyBTdGFjayBQYXJhbWV0ZXJzXG5cbi8vIHJlbGF0ZWQgdG8gYXJjaGl0ZWN0dXJlLiBJZiBzZXQgdG8gZmFsc2UsIHRyYW5zZm9ybWVkIGltYWdlcyBhcmUgbm90IHN0b3JlZCBpbiBTMywgYW5kIGFsbCBpbWFnZSByZXF1ZXN0cyBsYW5kIG9uIExhbWJkYVxudmFyIFNUT1JFX1RSQU5TRk9STUVEX0lNQUdFUyA9ICd0cnVlJztcbi8vIFBhcmFtZXRlcnMgb2YgUzMgYnVja2V0IHdoZXJlIG9yaWdpbmFsIGltYWdlcyBhcmUgc3RvcmVkXG52YXIgUzNfSU1BR0VfQlVDS0VUX05BTUU6IHN0cmluZztcbi8vIENsb3VkRnJvbnQgcGFyYW1ldGVyc1xudmFyIENMT1VERlJPTlRfT1JJR0lOX1NISUVMRF9SRUdJT04gPSBnZXRPcmlnaW5TaGllbGRSZWdpb24oXG5cdHByb2Nlc3MuZW52LkFXU19SRUdJT04gfHwgcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OIHx8ICd1cy1lYXN0LTEnLFxuKTtcbnZhciBDTE9VREZST05UX0NPUlNfRU5BQkxFRCA9ICd0cnVlJztcbi8vIFBhcmFtZXRlcnMgb2YgdHJhbnNmb3JtZWQgaW1hZ2VzXG52YXIgUzNfVFJBTlNGT1JNRURfSU1BR0VfRVhQSVJBVElPTl9EVVJBVElPTiA9ICc5MCc7XG52YXIgUzNfVFJBTlNGT1JNRURfSU1BR0VfQ0FDSEVfVFRMID0gJ21heC1hZ2U9MzE2MjI0MDAnO1xuLy8gTWF4IGltYWdlIHNpemUgaW4gYnl0ZXMuIElmIGdlbmVyYXRlZCBpbWFnZXMgYXJlIHN0b3JlZCBvbiBTMywgYmlnZ2VyIGltYWdlcyBhcmUgZ2VuZXJhdGVkLCBzdG9yZWQgb24gUzNcbi8vIGFuZCByZXF1ZXN0IGlzIHJlZGlyZWN0IHRvIHRoZSBnZW5lcmF0ZWQgaW1hZ2UuIE90aGVyd2lzZSwgYW4gYXBwbGljYXRpb24gZXJyb3IgaXMgc2VudC5cbnZhciBNQVhfSU1BR0VfU0laRSA9ICc0NzAwMDAwJztcbi8vIExhbWJkYSBQYXJhbWV0ZXJzXG52YXIgTEFNQkRBX01FTU9SWSA9ICcxNTAwJztcbnZhciBMQU1CREFfVElNRU9VVCA9ICc2MCc7XG4vLyBXaGV0aGVyIHRvIGRlcGxveSBhIHNhbXBsZSB3ZWJzaXRlIHJlZmVyZW5jZWQgaW4gaHR0cHM6Ly9hd3MuYW1hem9uLmNvbS9ibG9ncy9uZXR3b3JraW5nLWFuZC1jb250ZW50LWRlbGl2ZXJ5L2ltYWdlLW9wdGltaXphdGlvbi11c2luZy1hbWF6b24tY2xvdWRmcm9udC1hbmQtYXdzLWxhbWJkYS9cbnZhciBERVBMT1lfU0FNUExFX1dFQlNJVEUgPSAnZmFsc2UnO1xuXG50eXBlIEltYWdlRGVsaXZlcnlDYWNoZUJlaGF2aW9yQ29uZmlnID0ge1xuXHRvcmlnaW46IGFueTtcblx0dmlld2VyUHJvdG9jb2xQb2xpY3k6IGFueTtcblx0Y2FjaGVQb2xpY3k6IGFueTtcblx0ZnVuY3Rpb25Bc3NvY2lhdGlvbnM6IGFueTtcblx0cmVzcG9uc2VIZWFkZXJzUG9saWN5PzogYW55O1xufTtcblxudHlwZSBMYW1iZGFFbnYgPSB7XG5cdG9yaWdpbmFsSW1hZ2VCdWNrZXROYW1lOiBzdHJpbmc7XG5cdHRyYW5zZm9ybWVkSW1hZ2VCdWNrZXROYW1lPzogYW55O1xuXHR0cmFuc2Zvcm1lZEltYWdlQ2FjaGVUVEw6IHN0cmluZztcblx0bWF4SW1hZ2VTaXplOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY2xhc3MgSW1hZ2VPcHRpbWl6YXRpb25TdGFjayBleHRlbmRzIFN0YWNrIHtcblx0Y29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG5cdFx0c3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cblx0XHQvLyBDaGFuZ2Ugc3RhY2sgcGFyYW1ldGVycyBiYXNlZCBvbiBwcm92aWRlZCBjb250ZXh0XG5cdFx0U1RPUkVfVFJBTlNGT1JNRURfSU1BR0VTID1cblx0XHRcdHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdTVE9SRV9UUkFOU0ZPUk1FRF9JTUFHRVMnKSB8fCBTVE9SRV9UUkFOU0ZPUk1FRF9JTUFHRVM7XG5cdFx0UzNfVFJBTlNGT1JNRURfSU1BR0VfRVhQSVJBVElPTl9EVVJBVElPTiA9XG5cdFx0XHR0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnUzNfVFJBTlNGT1JNRURfSU1BR0VfRVhQSVJBVElPTl9EVVJBVElPTicpIHx8XG5cdFx0XHRTM19UUkFOU0ZPUk1FRF9JTUFHRV9FWFBJUkFUSU9OX0RVUkFUSU9OO1xuXHRcdFMzX1RSQU5TRk9STUVEX0lNQUdFX0NBQ0hFX1RUTCA9XG5cdFx0XHR0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnUzNfVFJBTlNGT1JNRURfSU1BR0VfQ0FDSEVfVFRMJykgfHxcblx0XHRcdFMzX1RSQU5TRk9STUVEX0lNQUdFX0NBQ0hFX1RUTDtcblx0XHRTM19JTUFHRV9CVUNLRVRfTkFNRSA9XG5cdFx0XHR0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnUzNfSU1BR0VfQlVDS0VUX05BTUUnKSB8fCBTM19JTUFHRV9CVUNLRVRfTkFNRTtcblx0XHRDTE9VREZST05UX09SSUdJTl9TSElFTERfUkVHSU9OID1cblx0XHRcdHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdDTE9VREZST05UX09SSUdJTl9TSElFTERfUkVHSU9OJykgfHxcblx0XHRcdENMT1VERlJPTlRfT1JJR0lOX1NISUVMRF9SRUdJT047XG5cdFx0Q0xPVURGUk9OVF9DT1JTX0VOQUJMRUQgPVxuXHRcdFx0dGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ0NMT1VERlJPTlRfQ09SU19FTkFCTEVEJykgfHwgQ0xPVURGUk9OVF9DT1JTX0VOQUJMRUQ7XG5cdFx0TEFNQkRBX01FTU9SWSA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdMQU1CREFfTUVNT1JZJykgfHwgTEFNQkRBX01FTU9SWTtcblx0XHRMQU1CREFfVElNRU9VVCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdMQU1CREFfVElNRU9VVCcpIHx8IExBTUJEQV9USU1FT1VUO1xuXHRcdE1BWF9JTUFHRV9TSVpFID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ01BWF9JTUFHRV9TSVpFJykgfHwgTUFYX0lNQUdFX1NJWkU7XG5cdFx0REVQTE9ZX1NBTVBMRV9XRUJTSVRFID1cblx0XHRcdHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdERVBMT1lfU0FNUExFX1dFQlNJVEUnKSB8fCBERVBMT1lfU0FNUExFX1dFQlNJVEU7XG5cblx0XHQvLyBkZXBsb3kgYSBzYW1wbGUgd2Vic2l0ZSBmb3IgdGVzdGluZyBpZiByZXF1aXJlZFxuXHRcdGlmIChERVBMT1lfU0FNUExFX1dFQlNJVEUgPT09ICd0cnVlJykge1xuXHRcdFx0dmFyIHNhbXBsZVdlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdzMy1zYW1wbGUtd2Vic2l0ZS1idWNrZXQnLCB7XG5cdFx0XHRcdHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcblx0XHRcdFx0YmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcblx0XHRcdFx0ZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuXHRcdFx0XHRlbmZvcmNlU1NMOiB0cnVlLFxuXHRcdFx0XHRhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcblx0XHRcdH0pO1xuXG5cdFx0XHR2YXIgc2FtcGxlV2Vic2l0ZURlbGl2ZXJ5ID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHQnd2Vic2l0ZURlbGl2ZXJ5RGlzdHJpYnV0aW9uJyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbW1lbnQ6ICdpbWFnZSBvcHRpbWl6YXRpb24gLSBzYW1wbGUgd2Vic2l0ZScsXG5cdFx0XHRcdFx0ZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcblx0XHRcdFx0XHRkZWZhdWx0QmVoYXZpb3I6IHtcblx0XHRcdFx0XHRcdG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oc2FtcGxlV2Vic2l0ZUJ1Y2tldCksXG5cdFx0XHRcdFx0XHR2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0KTtcblxuXHRcdFx0bmV3IENmbk91dHB1dCh0aGlzLCAnU2FtcGxlV2Vic2l0ZURvbWFpbicsIHtcblx0XHRcdFx0ZGVzY3JpcHRpb246ICdTYW1wbGUgd2Vic2l0ZSBkb21haW4nLFxuXHRcdFx0XHR2YWx1ZTogc2FtcGxlV2Vic2l0ZURlbGl2ZXJ5LmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG5cdFx0XHR9KTtcblx0XHRcdG5ldyBDZm5PdXRwdXQodGhpcywgJ1NhbXBsZVdlYnNpdGVTM0J1Y2tldCcsIHtcblx0XHRcdFx0ZGVzY3JpcHRpb246ICdTMyBidWNrZXQgdXNlIGJ5IHRoZSBzYW1wbGUgd2Vic2l0ZScsXG5cdFx0XHRcdHZhbHVlOiBzYW1wbGVXZWJzaXRlQnVja2V0LmJ1Y2tldE5hbWUsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBGb3IgdGhlIGJ1Y2tldCBoYXZpbmcgb3JpZ2luYWwgaW1hZ2VzLCBlaXRoZXIgdXNlIGFuIGV4dGVybmFsIG9uZSwgb3IgY3JlYXRlIG9uZSB3aXRoIHNvbWUgc2FtcGxlcyBwaG90b3MuXG5cdFx0dmFyIG9yaWdpbmFsSW1hZ2VCdWNrZXQ7XG5cdFx0dmFyIHRyYW5zZm9ybWVkSW1hZ2VCdWNrZXQ7XG5cblx0XHRpZiAoUzNfSU1BR0VfQlVDS0VUX05BTUUpIHtcblx0XHRcdG9yaWdpbmFsSW1hZ2VCdWNrZXQgPSBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUoXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdCdpbXBvcnRlZC1vcmlnaW5hbC1pbWFnZS1idWNrZXQnLFxuXHRcdFx0XHRTM19JTUFHRV9CVUNLRVRfTkFNRSxcblx0XHRcdCk7XG5cdFx0XHRuZXcgQ2ZuT3V0cHV0KHRoaXMsICdPcmlnaW5hbEltYWdlc1MzQnVja2V0Jywge1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogJ1MzIGJ1Y2tldCB3aGVyZSBvcmlnaW5hbCBpbWFnZXMgYXJlIHN0b3JlZCcsXG5cdFx0XHRcdHZhbHVlOiBvcmlnaW5hbEltYWdlQnVja2V0LmJ1Y2tldE5hbWUsXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3JpZ2luYWxJbWFnZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ3MzLXNhbXBsZS1vcmlnaW5hbC1pbWFnZS1idWNrZXQnLCB7XG5cdFx0XHRcdHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcblx0XHRcdFx0YmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcblx0XHRcdFx0ZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuXHRcdFx0XHRlbmZvcmNlU1NMOiB0cnVlLFxuXHRcdFx0XHRhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcblx0XHRcdH0pO1xuXHRcdFx0bmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVdlYnNpdGUnLCB7XG5cdFx0XHRcdHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQoJy4vaW1hZ2Utc2FtcGxlJyldLFxuXHRcdFx0XHRkZXN0aW5hdGlvbkJ1Y2tldDogb3JpZ2luYWxJbWFnZUJ1Y2tldCxcblx0XHRcdFx0ZGVzdGluYXRpb25LZXlQcmVmaXg6ICdpbWFnZXMvcmlvLycsXG5cdFx0XHR9KTtcblx0XHRcdG5ldyBDZm5PdXRwdXQodGhpcywgJ09yaWdpbmFsSW1hZ2VzUzNCdWNrZXQnLCB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uOiAnUzMgYnVja2V0IHdoZXJlIG9yaWdpbmFsIGltYWdlcyBhcmUgc3RvcmVkJyxcblx0XHRcdFx0dmFsdWU6IG9yaWdpbmFsSW1hZ2VCdWNrZXQuYnVja2V0TmFtZSxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIGNyZWF0ZSBidWNrZXQgZm9yIHRyYW5zZm9ybWVkIGltYWdlcyBpZiBlbmFibGVkIGluIHRoZSBhcmNoaXRlY3R1cmVcblx0XHRpZiAoU1RPUkVfVFJBTlNGT1JNRURfSU1BR0VTID09PSAndHJ1ZScpIHtcblx0XHRcdHRyYW5zZm9ybWVkSW1hZ2VCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdzMy10cmFuc2Zvcm1lZC1pbWFnZS1idWNrZXQnLCB7XG5cdFx0XHRcdHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcblx0XHRcdFx0YXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG5cdFx0XHRcdGxpZmVjeWNsZVJ1bGVzOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZXhwaXJhdGlvbjogRHVyYXRpb24uZGF5cyhwYXJzZUludChTM19UUkFOU0ZPUk1FRF9JTUFHRV9FWFBJUkFUSU9OX0RVUkFUSU9OKSksXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XSxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIHByZXBhcmUgZW52IHZhcmlhYmxlIGZvciBMYW1iZGFcblx0XHR2YXIgbGFtYmRhRW52OiBMYW1iZGFFbnYgPSB7XG5cdFx0XHRvcmlnaW5hbEltYWdlQnVja2V0TmFtZTogb3JpZ2luYWxJbWFnZUJ1Y2tldC5idWNrZXROYW1lLFxuXHRcdFx0dHJhbnNmb3JtZWRJbWFnZUNhY2hlVFRMOiBTM19UUkFOU0ZPUk1FRF9JTUFHRV9DQUNIRV9UVEwsXG5cdFx0XHRtYXhJbWFnZVNpemU6IE1BWF9JTUFHRV9TSVpFLFxuXHRcdH07XG5cdFx0aWYgKHRyYW5zZm9ybWVkSW1hZ2VCdWNrZXQpXG5cdFx0XHRsYW1iZGFFbnYudHJhbnNmb3JtZWRJbWFnZUJ1Y2tldE5hbWUgPSB0cmFuc2Zvcm1lZEltYWdlQnVja2V0LmJ1Y2tldE5hbWU7XG5cblx0XHQvLyBJQU0gcG9saWN5IHRvIHJlYWQgZnJvbSB0aGUgUzMgYnVja2V0IGNvbnRhaW5pbmcgdGhlIG9yaWdpbmFsIGltYWdlc1xuXHRcdGNvbnN0IHMzUmVhZE9yaWdpbmFsSW1hZ2VzUG9saWN5ID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuXHRcdFx0YWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcblx0XHRcdHJlc291cmNlczogWydhcm46YXdzOnMzOjo6JyArIG9yaWdpbmFsSW1hZ2VCdWNrZXQuYnVja2V0TmFtZSArICcvKiddLFxuXHRcdH0pO1xuXG5cdFx0Ly8gc3RhdGVtZW50cyBvZiB0aGUgSUFNIHBvbGljeSB0byBhdHRhY2ggdG8gTGFtYmRhXG5cdFx0dmFyIGlhbVBvbGljeVN0YXRlbWVudHMgPSBbczNSZWFkT3JpZ2luYWxJbWFnZXNQb2xpY3ldO1xuXG5cdFx0Ly8gQ3JlYXRlIExhbWJkYSBmb3IgaW1hZ2UgcHJvY2Vzc2luZ1xuXHRcdHZhciBsYW1iZGFQcm9wcyA9IHtcblx0XHRcdHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuXHRcdFx0aGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuXHRcdFx0Y29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdmdW5jdGlvbnMvaW1hZ2UtcHJvY2Vzc2luZycpLFxuXHRcdFx0dGltZW91dDogRHVyYXRpb24uc2Vjb25kcyhwYXJzZUludChMQU1CREFfVElNRU9VVCkpLFxuXHRcdFx0bWVtb3J5U2l6ZTogcGFyc2VJbnQoTEFNQkRBX01FTU9SWSksXG5cdFx0XHRlbnZpcm9ubWVudDogbGFtYmRhRW52LFxuXHRcdFx0bG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcblx0XHR9O1xuXHRcdHZhciBpbWFnZVByb2Nlc3NpbmcgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdpbWFnZS1vcHRpbWl6YXRpb24nLCBsYW1iZGFQcm9wcyk7XG5cblx0XHQvLyBFbmFibGUgTGFtYmRhIFVSTFxuXHRcdGNvbnN0IGltYWdlUHJvY2Vzc2luZ1VSTCA9IGltYWdlUHJvY2Vzc2luZy5hZGRGdW5jdGlvblVybCgpO1xuXG5cdFx0Ly8gTGV2ZXJhZ2UgQ0RLIEludHJpbnNpY3MgdG8gZ2V0IHRoZSBob3N0bmFtZSBvZiB0aGUgTGFtYmRhIFVSTFxuXHRcdGNvbnN0IGltYWdlUHJvY2Vzc2luZ0RvbWFpbk5hbWUgPSBGbi5wYXJzZURvbWFpbk5hbWUoaW1hZ2VQcm9jZXNzaW5nVVJMLnVybCk7XG5cblx0XHQvLyBDcmVhdGUgYSBDbG91ZEZyb250IG9yaWdpbjogUzMgd2l0aCBmYWxsYmFjayB0byBMYW1iZGEgd2hlbiBpbWFnZSBuZWVkcyB0byBiZSB0cmFuc2Zvcm1lZCwgb3RoZXJ3aXNlIHdpdGggTGFtYmRhIGFzIHNvbGUgb3JpZ2luXG5cdFx0dmFyIGltYWdlT3JpZ2luO1xuXG5cdFx0aWYgKHRyYW5zZm9ybWVkSW1hZ2VCdWNrZXQpIHtcblx0XHRcdGltYWdlT3JpZ2luID0gbmV3IG9yaWdpbnMuT3JpZ2luR3JvdXAoe1xuXHRcdFx0XHRwcmltYXJ5T3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbih0cmFuc2Zvcm1lZEltYWdlQnVja2V0LCB7XG5cdFx0XHRcdFx0b3JpZ2luU2hpZWxkUmVnaW9uOiBDTE9VREZST05UX09SSUdJTl9TSElFTERfUkVHSU9OLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0ZmFsbGJhY2tPcmlnaW46IG5ldyBvcmlnaW5zLkh0dHBPcmlnaW4oaW1hZ2VQcm9jZXNzaW5nRG9tYWluTmFtZSwge1xuXHRcdFx0XHRcdG9yaWdpblNoaWVsZFJlZ2lvbjogQ0xPVURGUk9OVF9PUklHSU5fU0hJRUxEX1JFR0lPTixcblx0XHRcdFx0fSksXG5cdFx0XHRcdGZhbGxiYWNrU3RhdHVzQ29kZXM6IFs0MDMsIDUwMCwgNTAzLCA1MDRdLFxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIHdyaXRlIHBvbGljeSBmb3IgTGFtYmRhIG9uIHRoZSBzMyBidWNrZXQgZm9yIHRyYW5zZm9ybWVkIGltYWdlc1xuXHRcdFx0dmFyIHMzV3JpdGVUcmFuc2Zvcm1lZEltYWdlc1BvbGljeSA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcblx0XHRcdFx0YWN0aW9uczogWydzMzpQdXRPYmplY3QnXSxcblx0XHRcdFx0cmVzb3VyY2VzOiBbJ2Fybjphd3M6czM6OjonICsgdHJhbnNmb3JtZWRJbWFnZUJ1Y2tldC5idWNrZXROYW1lICsgJy8qJ10sXG5cdFx0XHR9KTtcblx0XHRcdGlhbVBvbGljeVN0YXRlbWVudHMucHVzaChzM1dyaXRlVHJhbnNmb3JtZWRJbWFnZXNQb2xpY3kpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpbWFnZU9yaWdpbiA9IG5ldyBvcmlnaW5zLkh0dHBPcmlnaW4oaW1hZ2VQcm9jZXNzaW5nRG9tYWluTmFtZSwge1xuXHRcdFx0XHRvcmlnaW5TaGllbGRSZWdpb246IENMT1VERlJPTlRfT1JJR0lOX1NISUVMRF9SRUdJT04sXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBhdHRhY2ggaWFtIHBvbGljeSB0byB0aGUgcm9sZSBhc3N1bWVkIGJ5IExhbWJkYVxuXHRcdGltYWdlUHJvY2Vzc2luZy5yb2xlPy5hdHRhY2hJbmxpbmVQb2xpY3koXG5cdFx0XHRuZXcgaWFtLlBvbGljeSh0aGlzLCAncmVhZC13cml0ZS1idWNrZXQtcG9saWN5Jywge1xuXHRcdFx0XHRzdGF0ZW1lbnRzOiBpYW1Qb2xpY3lTdGF0ZW1lbnRzLFxuXHRcdFx0fSksXG5cdFx0KTtcblxuXHRcdC8vIENyZWF0ZSBhIENsb3VkRnJvbnQgRnVuY3Rpb24gZm9yIHVybCByZXdyaXRlc1xuXHRcdGNvbnN0IHVybFJld3JpdGVGdW5jdGlvbiA9IG5ldyBjbG91ZGZyb250LkZ1bmN0aW9uKHRoaXMsICd1cmxSZXdyaXRlJywge1xuXHRcdFx0Y29kZTogY2xvdWRmcm9udC5GdW5jdGlvbkNvZGUuZnJvbUZpbGUoe1xuXHRcdFx0XHRmaWxlUGF0aDogJ2Z1bmN0aW9ucy91cmwtcmV3cml0ZS9pbmRleC5qcycsXG5cdFx0XHR9KSxcblx0XHRcdGZ1bmN0aW9uTmFtZTogYHVybFJld3JpdGVGdW5jdGlvbiR7dGhpcy5ub2RlLmFkZHJ9YCxcblx0XHR9KTtcblxuXHRcdHZhciBpbWFnZURlbGl2ZXJ5Q2FjaGVCZWhhdmlvckNvbmZpZzogSW1hZ2VEZWxpdmVyeUNhY2hlQmVoYXZpb3JDb25maWcgPSB7XG5cdFx0XHRvcmlnaW46IGltYWdlT3JpZ2luLFxuXHRcdFx0dmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG5cdFx0XHRjYWNoZVBvbGljeTogbmV3IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kodGhpcywgYEltYWdlQ2FjaGVQb2xpY3kke3RoaXMubm9kZS5hZGRyfWAsIHtcblx0XHRcdFx0ZGVmYXVsdFR0bDogRHVyYXRpb24uaG91cnMoMjQpLFxuXHRcdFx0XHRtYXhUdGw6IER1cmF0aW9uLmRheXMoMzY1KSxcblx0XHRcdFx0bWluVHRsOiBEdXJhdGlvbi5zZWNvbmRzKDApLFxuXHRcdFx0XHRxdWVyeVN0cmluZ0JlaGF2aW9yOiBjbG91ZGZyb250LkNhY2hlUXVlcnlTdHJpbmdCZWhhdmlvci5hbGwoKSxcblx0XHRcdH0pLFxuXHRcdFx0ZnVuY3Rpb25Bc3NvY2lhdGlvbnM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGV2ZW50VHlwZTogY2xvdWRmcm9udC5GdW5jdGlvbkV2ZW50VHlwZS5WSUVXRVJfUkVRVUVTVCxcblx0XHRcdFx0XHRmdW5jdGlvbjogdXJsUmV3cml0ZUZ1bmN0aW9uLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9O1xuXG5cdFx0aWYgKENMT1VERlJPTlRfQ09SU19FTkFCTEVEID09PSAndHJ1ZScpIHtcblx0XHRcdC8vIENyZWF0aW5nIGEgY3VzdG9tIHJlc3BvbnNlIGhlYWRlcnMgcG9saWN5LiBDT1JTIGFsbG93ZWQgZm9yIGFsbCBvcmlnaW5zLlxuXHRcdFx0Y29uc3QgaW1hZ2VSZXNwb25zZUhlYWRlcnNQb2xpY3kgPSBuZXcgY2xvdWRmcm9udC5SZXNwb25zZUhlYWRlcnNQb2xpY3koXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdGBSZXNwb25zZUhlYWRlcnNQb2xpY3kke3RoaXMubm9kZS5hZGRyfWAsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXNwb25zZUhlYWRlcnNQb2xpY3lOYW1lOiBgSW1hZ2VSZXNwb25zZVBvbGljeSR7dGhpcy5ub2RlLmFkZHJ9YCxcblx0XHRcdFx0XHRjb3JzQmVoYXZpb3I6IHtcblx0XHRcdFx0XHRcdGFjY2Vzc0NvbnRyb2xBbGxvd0NyZWRlbnRpYWxzOiBmYWxzZSxcblx0XHRcdFx0XHRcdGFjY2Vzc0NvbnRyb2xBbGxvd0hlYWRlcnM6IFsnKiddLFxuXHRcdFx0XHRcdFx0YWNjZXNzQ29udHJvbEFsbG93TWV0aG9kczogWydHRVQnXSxcblx0XHRcdFx0XHRcdGFjY2Vzc0NvbnRyb2xBbGxvd09yaWdpbnM6IFsnKiddLFxuXHRcdFx0XHRcdFx0YWNjZXNzQ29udHJvbE1heEFnZTogRHVyYXRpb24uc2Vjb25kcyg2MDApLFxuXHRcdFx0XHRcdFx0b3JpZ2luT3ZlcnJpZGU6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gcmVjb2duaXppbmcgaW1hZ2UgcmVxdWVzdHMgdGhhdCB3ZXJlIHByb2Nlc3NlZCBieSB0aGlzIHNvbHV0aW9uXG5cdFx0XHRcdFx0Y3VzdG9tSGVhZGVyc0JlaGF2aW9yOiB7XG5cdFx0XHRcdFx0XHRjdXN0b21IZWFkZXJzOiBbXG5cdFx0XHRcdFx0XHRcdHsgaGVhZGVyOiAneC1hd3MtaW1hZ2Utb3B0aW1pemF0aW9uJywgdmFsdWU6ICd2MS4wJywgb3ZlcnJpZGU6IHRydWUgfSxcblx0XHRcdFx0XHRcdFx0eyBoZWFkZXI6ICd2YXJ5JywgdmFsdWU6ICdhY2NlcHQnLCBvdmVycmlkZTogdHJ1ZSB9LFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0KTtcblx0XHRcdGltYWdlRGVsaXZlcnlDYWNoZUJlaGF2aW9yQ29uZmlnLnJlc3BvbnNlSGVhZGVyc1BvbGljeSA9IGltYWdlUmVzcG9uc2VIZWFkZXJzUG9saWN5O1xuXHRcdH1cblx0XHRjb25zdCBpbWFnZURlbGl2ZXJ5ID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdpbWFnZURlbGl2ZXJ5RGlzdHJpYnV0aW9uJywge1xuXHRcdFx0Y29tbWVudDogJ2ltYWdlIG9wdGltaXphdGlvbiAtIGltYWdlIGRlbGl2ZXJ5Jyxcblx0XHRcdGRlZmF1bHRCZWhhdmlvcjogaW1hZ2VEZWxpdmVyeUNhY2hlQmVoYXZpb3JDb25maWcsXG5cdFx0fSk7XG5cblx0XHQvLyBBREQgT0FDIGJldHdlZW4gQ2xvdWRGcm9udCBhbmQgTGFtYmRhVVJMXG5cdFx0Y29uc3Qgb2FjID0gbmV3IGNsb3VkZnJvbnQuQ2ZuT3JpZ2luQWNjZXNzQ29udHJvbCh0aGlzLCAnT0FDJywge1xuXHRcdFx0b3JpZ2luQWNjZXNzQ29udHJvbENvbmZpZzoge1xuXHRcdFx0XHRuYW1lOiBgb2FjJHt0aGlzLm5vZGUuYWRkcn1gLFxuXHRcdFx0XHRvcmlnaW5BY2Nlc3NDb250cm9sT3JpZ2luVHlwZTogJ2xhbWJkYScsXG5cdFx0XHRcdHNpZ25pbmdCZWhhdmlvcjogJ2Fsd2F5cycsXG5cdFx0XHRcdHNpZ25pbmdQcm90b2NvbDogJ3NpZ3Y0Jyxcblx0XHRcdH0sXG5cdFx0fSk7XG5cblx0XHRjb25zdCBjZm5JbWFnZURlbGl2ZXJ5ID0gaW1hZ2VEZWxpdmVyeS5ub2RlLmRlZmF1bHRDaGlsZCBhcyBDZm5EaXN0cmlidXRpb247XG5cdFx0Y2ZuSW1hZ2VEZWxpdmVyeS5hZGRQcm9wZXJ0eU92ZXJyaWRlKFxuXHRcdFx0YERpc3RyaWJ1dGlvbkNvbmZpZy5PcmlnaW5zLiR7U1RPUkVfVFJBTlNGT1JNRURfSU1BR0VTID09PSAndHJ1ZScgPyAnMScgOiAnMCd9Lk9yaWdpbkFjY2Vzc0NvbnRyb2xJZGAsXG5cdFx0XHRvYWMuZ2V0QXR0KCdJZCcpLFxuXHRcdCk7XG5cblx0XHRpbWFnZVByb2Nlc3NpbmcuYWRkUGVybWlzc2lvbignQWxsb3dDbG91ZEZyb250U2VydmljZVByaW5jaXBhbCcsIHtcblx0XHRcdHByaW5jaXBhbDogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdjbG91ZGZyb250LmFtYXpvbmF3cy5jb20nKSxcblx0XHRcdGFjdGlvbjogJ2xhbWJkYTpJbnZva2VGdW5jdGlvblVybCcsXG5cdFx0XHRzb3VyY2VBcm46IGBhcm46YXdzOmNsb3VkZnJvbnQ6OiR7dGhpcy5hY2NvdW50fTpkaXN0cmlidXRpb24vJHtpbWFnZURlbGl2ZXJ5LmRpc3RyaWJ1dGlvbklkfWAsXG5cdFx0fSk7XG5cblx0XHRuZXcgQ2ZuT3V0cHV0KHRoaXMsICdJbWFnZURlbGl2ZXJ5RG9tYWluJywge1xuXHRcdFx0ZGVzY3JpcHRpb246ICdEb21haW4gbmFtZSBvZiBpbWFnZSBkZWxpdmVyeScsXG5cdFx0XHR2YWx1ZTogaW1hZ2VEZWxpdmVyeS5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxuXHRcdH0pO1xuXHR9XG59XG4iXX0=