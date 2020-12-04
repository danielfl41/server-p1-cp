import Axios, { AxiosInstance } from 'axios';
import edb from '../data/edb.json';
import { Logger } from '../tools/Logger';

export class WorldBank {
	private static indicators = {
		PIB: 'NY.GDP.MKTP.CD',
		TDA: 'SL.UEM.TOTL.ZS',
		IFL: 'FP.CPI.TOTL.ZG',
		IVA: 'GC.TAX.GSRV.VA.ZS',
		PRF: 'GC.TAX.TOTL.GD.ZS',
		TSC: 'PA.NUS.FCRF',
		DBI: 'IC.BUS.EASE.XQ',
	};
	private static resolveIndicator(value: string): keyof WorldBank.Indicator {
		const entry = Object.entries(this.indicators).find((indicator) => indicator[1] === value);
		if (!entry) throw new Error('Indicator not found');
		return entry[0] as keyof WorldBank.Indicator;
	}
	constructor() {
		this.api = Axios.create({
			baseURL: 'http://api.worldbank.org/V2',
			responseType: 'json',
			params: {
				format: 'json',
			},
		});
	}
	private logger = new Logger('WorldBank');
	private api: AxiosInstance;
	private get indicators() {
		return Object.values(WorldBank.indicators).join(';');
	}
	async find(countryId: string): Promise<WorldBank.Response> {
		let pages = 1;
		const response: WorldBank.Response = {};
		for (let page = 1; page <= pages; page++) {
			const data = (
				await this.api.get<WorldBank.Model>(
					`country/${countryId}/indicator/${this.indicators}`,
					{
						params: {
							per_page: 100,
							frequency: 'Y',
							source: 2,
							page,
						},
					},
				)
			).data;
			if (data[0].pages === undefined)
				this.logger.debug(`${countryId}, undefined total pages`);
			else pages = data[0].pages;
			this.logger.debug(`${countryId}, page ${page}/${pages}`);
			const indicators = data[1];
			for (let x = 0; x < indicators.length; x++) {
				const indicator = indicators[x];
				const indicatorId = WorldBank.resolveIndicator(indicator.indicator.id);
				const value = indicator.value;
				const edbYear = edb[indicator.date as keyof typeof edb];
				const iso3code = indicator.countryiso3code as keyof typeof edbYear;
				if (!response[indicator.date])
					response[indicator.date] = {
						DBI: null,
						PIB: null,
						IFL: null,
						IVA: null,
						PRF: null,
						TDA: null,
						TSC: null,
						SMI: null,
					};
				response[indicator.date][indicatorId] = value;
				if (indicatorId === 'DBI' && !value && edbYear && edbYear[iso3code])
					response[indicator.date]['DBI'] = edbYear[iso3code].rank;
			}
		}
		return response;
	}
}
export namespace WorldBank {
	export type entry = { id: string; value: string };
	export interface PaggedList {
		page: number;
		pages: number;
		per_page: number;
		total: number;
		sourceid: string;
		lastupdated: string;
	}
	export interface ApiIndicator {
		indicator: entry;
		country: entry;
		countryiso3code: string;
		date: string;
		value: number;
		scale: string;
		unit: string;
		obs_status: string;
		decimal: string;
	}
	export type Model = [PaggedList, ApiIndicator[]];
	export interface Response {
		[key: string]: Indicator;
	}
	export interface Indicator {
		PIB: number;
		TDA: number;
		IFL: number;
		IVA: number;
		PRF: number;
		TSC: number;
		DBI: number;
		SMI: number;
	}
}
