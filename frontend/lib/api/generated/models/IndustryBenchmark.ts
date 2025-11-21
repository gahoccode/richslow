/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RatioBenchmark } from './RatioBenchmark';
/**
 * Industry benchmark data for financial ratios comparison.
 */
export type IndustryBenchmark = {
    /**
     * Name of the industry
     */
    industry_name: string;
    /**
     * Industry ID (ICB code)
     */
    industry_id?: (number | null);
    /**
     * Total companies in industry
     */
    company_count: number;
    /**
     * Companies successfully analyzed
     */
    companies_analyzed: number;
    /**
     * Ratio benchmarks by name
     */
    benchmarks: Record<string, RatioBenchmark>;
    /**
     * List of available ratio benchmarks
     */
    ratios_available: Array<string>;
};

