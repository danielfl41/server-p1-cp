import { Inject, Service } from 'typedi';
import { Logger } from 'winston';

@Service()
export class CountriesService {
	static formatCountry(rawData: unknown): CountriesService.Country {
		let country: CountriesService.Country = {
			abbr: '',
			code: '',
			currencyCode: '',
			currencyName: '',
			lang: '',
			name: '',
		};
		return country;
	}
	constructor(@Inject('logger') private logger: Logger) {}
	async getCountry(code: string): Promise<Required<CountriesService.Country>> {
		this.logger.silly('countries getCountry, code: %o', code);
		return CountriesService.formatCountry(code) as Required<CountriesService.Country>;
	}
	async getAll(): Promise<CountriesService.CountryList[]> {
		this.logger.silly('countries getAll');
		return [CountriesService.formatCountry('test')];
	}
}
export namespace CountriesService {
	export interface Country {
		abbr: string;
		code: string;
		currencyCode: string;
		currencyName: string;
		lang?: string;
		name?: string;
	}
	export interface CountryList extends Omit<Country, 'name' | 'lang'> {}
}
