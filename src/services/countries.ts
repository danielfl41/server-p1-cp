import { Countries } from 'db_infb8090';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { CustomError } from '../controllers/CustomError';
import { DBController } from '../controllers/DBController';

@injectable()
export class CountriesService {
	static formatCountry(code: string, rawData: Countries.Model): CountriesService.Country {
		const country: CountriesService.Country = {
			code,
			abbr: rawData.iso_3166_1_alpha_3,
			currencyCode: rawData.iso_4217,
			currencyName: rawData.currencyName,
			lang: rawData.iso_639_1,
			name: rawData.countryName,
		};
		return country;
	}
	constructor(
		@inject('logger') private logger: Logger,
		@inject(DBController) private DBController: DBController,
	) {}
	async getCountry(code: string): Promise<Required<CountriesService.Country>> {
		this.logger.silly('countries getCountry, code: %o', code);
		try {
			const country = await this.DBController.$countries.fetch(code);
			return CountriesService.formatCountry(
				code,
				country,
			) as Required<CountriesService.Country>;
		} catch (error) {
			throw new CustomError('NOT_FOUND', 'País no encontrado', error);
		}
	}
	async getAll(): Promise<CountriesService.CountryList[]> {
		this.logger.silly('countries getAll');
		try {
			const list = await this.DBController.$countries.list();
			return list.map((country) => CountriesService.formatCountry(country._id, country.data));
		} catch (error) {
			throw new CustomError('UNKNOWN', 'Problemas al obtener los países', error);
		}
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
