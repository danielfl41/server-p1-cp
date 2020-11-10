import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { CountriesService } from './countries';

@Service()
export class IndicatorsService {
	static formatIndicators(rawData: unknown): IndicatorsService.indicators {
		const indicators: IndicatorsService.indicators = {
			code: '',
			country: CountriesService.formatCountry('') as IndicatorsService.indicators['country'],
			name: '',
			unit: '',
			value: NaN,
			year: NaN,
		};
		return indicators;
	}
	constructor(@Inject('logger') private logger: Logger) {}

	async getIndicators(
		countryCode: string,
		indicatorCode: string,
		period: number | { from: number; to: number },
	): Promise<IndicatorsService.indicators> {
		this.logger.silly('indicators getIndicators');
		return IndicatorsService.formatIndicators('');
	}
}
export namespace IndicatorsService {
	export interface indicators {
		code: string;
		country: Required<CountriesService.Country>;
		name: string;
		unit: string;
		value: number;
		year: number;
	}
}
