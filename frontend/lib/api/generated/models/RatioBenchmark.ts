/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Statistical benchmark for a single financial ratio.
 */
export type RatioBenchmark = {
    /**
     * Industry average (mean)
     */
    mean: number;
    /**
     * Industry median
     */
    median: number;
    /**
     * 25th percentile
     */
    p25: number;
    /**
     * 75th percentile
     */
    p75: number;
    /**
     * Standard deviation
     */
    std: number;
    /**
     * Number of companies in calculation
     */
    count: number;
};

