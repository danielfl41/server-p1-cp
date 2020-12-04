import Axios, { AxiosInstance } from 'axios';
import { Logger } from '../tools/Logger';

export class RestCountries {
	constructor() {
		this.api = Axios.create({
			baseURL: 'https://restcountries.eu/rest/v2',
			responseType: 'json',
		});
	}
	private api: AxiosInstance;
	private logger = new Logger('RestCountries');
	async list(): Promise<RestCountries.Model[]> {
		const countries = await this.api.get<RestCountries.Model[]>('all');
		const data = countries.data;
		this.logger.debug('Obtained countries', data.length);
		return data;
	}
}
export namespace RestCountries {
	export type currency = {
		code: string;
		name: string;
		symbol: string;
	};
	export type language = {
		iso639_1: string;
		iso639_2: string;
		name: string;
		nativeName: string;
	};
	export type regionalBloc = {
		acronym: string;
		name: string;
		otherAcronyms: string[];
		otherNames: string[];
	};
	export type translation = { [key: string]: string };
	export interface Model {
		name: string;
		topLevelDomain: string[];
		alpha2Code: string;
		alpha3Code: string;
		callingCodes: string[];
		capital: string;
		altSpellings: string[];
		region: string;
		subregion: string;
		population: number;
		latlng: [number, number];
		demonym: string;
		area: number;
		gini: number;
		timezones: string[];
		borders: string[];
		nativeName: string;
		numericCode: string;
		currencies: currency[];
		languages: language[];
		translations: translation;
		flag: string;
		regionalBlocs: regionalBloc[];
		cioc: string;
	}
}
