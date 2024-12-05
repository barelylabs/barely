#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const image_optimization_stack_1 = require("../lib/image-optimization-stack");
const app = new cdk.App();
new image_optimization_stack_1.ImageOptimizationStack(app, 'ImgTransformationStack', {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utb3B0aW1pemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2Utb3B0aW1pemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsOEVBQXlFO0FBR3pFLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksaURBQXNCLENBQUMsR0FBRyxFQUFFLHdCQUF3QixFQUFFLEVBRXpELENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBJbWFnZU9wdGltaXphdGlvblN0YWNrIH0gZnJvbSAnLi4vbGliL2ltYWdlLW9wdGltaXphdGlvbi1zdGFjayc7XG5cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBJbWFnZU9wdGltaXphdGlvblN0YWNrKGFwcCwgJ0ltZ1RyYW5zZm9ybWF0aW9uU3RhY2snLCB7XG5cbn0pO1xuXG4iXX0=