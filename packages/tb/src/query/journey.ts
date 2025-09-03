import { tinybird } from '..';
import {
	attributionAnalysisSchema,
	bioToCartFunnelSummarySchema,
	conversionByOriginSchema,
	dailyFunnelMetricsSchema,
	funnelByOriginSchema,
	hourlyPatternSchema,
	journeyFunnelParamsSchema,
	pathAnalysisSchema,
} from '../schema';

/**
 * Bio to cart funnel analysis - summary metrics
 */
export const pipe_bioToCartFunnelSummary = tinybird.buildPipe({
	pipe: 'bio_to_cart_funnel__summary_metrics',
	parameters: journeyFunnelParamsSchema,
	data: bioToCartFunnelSummarySchema,
});

/**
 * Bio to cart funnel analysis - breakdown by journey origin
 */
export const pipe_bioToCartFunnelByOrigin = tinybird.buildPipe({
	pipe: 'bio_to_cart_funnel__funnel_by_origin',
	parameters: journeyFunnelParamsSchema,
	data: funnelByOriginSchema,
});

/**
 * Bio to cart funnel analysis - hourly patterns
 */
export const pipe_bioToCartFunnelHourly = tinybird.buildPipe({
	pipe: 'bio_to_cart_funnel__hourly_pattern',
	parameters: journeyFunnelParamsSchema,
	data: hourlyPatternSchema,
});

/**
 * Journey funnel analysis - conversion by origin
 */
export const pipe_journeyConversionByOrigin = tinybird.buildPipe({
	pipe: 'journey_funnel_analysis__conversion_by_origin',
	parameters: journeyFunnelParamsSchema,
	data: conversionByOriginSchema,
});

/**
 * Journey funnel analysis - path analysis
 */
export const pipe_journeyPathAnalysis = tinybird.buildPipe({
	pipe: 'journey_funnel_analysis__path_analysis',
	parameters: journeyFunnelParamsSchema,
	data: pathAnalysisSchema,
});

/**
 * Journey funnel analysis - daily metrics
 */
export const pipe_journeyDailyMetrics = tinybird.buildPipe({
	pipe: 'journey_funnel_analysis__daily_funnel_metrics',
	parameters: journeyFunnelParamsSchema,
	data: dailyFunnelMetricsSchema,
});

/**
 * Journey funnel analysis - attribution analysis
 */
export const pipe_journeyAttributionAnalysis = tinybird.buildPipe({
	pipe: 'journey_funnel_analysis__attribution_analysis',
	parameters: journeyFunnelParamsSchema,
	data: attributionAnalysisSchema,
});
