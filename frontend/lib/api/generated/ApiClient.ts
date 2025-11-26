/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { CompanyService } from './services/CompanyService';
import { DefaultService } from './services/DefaultService';
import { FinancialStatementsService } from './services/FinancialStatementsService';
import { FundsService } from './services/FundsService';
import { HistoricalPricesService } from './services/HistoricalPricesService';
import { IndustryBenchmarkService } from './services/IndustryBenchmarkService';
import { QuarterlyRatiosService } from './services/QuarterlyRatiosService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ApiClient {
    public readonly company: CompanyService;
    public readonly default: DefaultService;
    public readonly financialStatements: FinancialStatementsService;
    public readonly funds: FundsService;
    public readonly historicalPrices: HistoricalPricesService;
    public readonly industryBenchmark: IndustryBenchmarkService;
    public readonly quarterlyRatios: QuarterlyRatiosService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '2.1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.company = new CompanyService(this.request);
        this.default = new DefaultService(this.request);
        this.financialStatements = new FinancialStatementsService(this.request);
        this.funds = new FundsService(this.request);
        this.historicalPrices = new HistoricalPricesService(this.request);
        this.industryBenchmark = new IndustryBenchmarkService(this.request);
        this.quarterlyRatios = new QuarterlyRatiosService(this.request);
    }
}

