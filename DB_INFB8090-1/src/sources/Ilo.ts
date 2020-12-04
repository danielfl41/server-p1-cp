import Axios, { AxiosInstance } from 'axios';
import { Logger } from '../tools/Logger';

export class Ilo {
	constructor() {
		this.api = Axios.create({
			baseURL: 'https://www.ilo.org/data-api/rest/v1/data',
			responseType: 'json',
			params: {
				detail: 'dataonly',
				format: 'codeonly',
			},
		});
	}
	private logger = new Logger('Ilo');
	private api: AxiosInstance;
	async findSMI(startPeriod: number, endPeriod: number): Promise<Ilo.Response> {
		const data = (
			await this.api.get<Ilo.Model>('DF_YI_ALL_EAR_INEE_NOC_NB', {
				params: {
					startPeriod,
					endPeriod,
				},
			})
		).data;
		this.logger.debug('Total series obtained', data.length);
		const response: Ilo.Response = {};
		data.forEach((indicator) => {
			const countryiso3code = indicator.refarea;
			const value = indicator.obs_Value;
			const year = indicator.time_Period;
			if (!response[year]) response[year] = {};
			response[year][countryiso3code] = { value };
		});
		return response;
	}
}
export namespace Ilo {
	export type Model = ApiIndicator[];
	export interface Indicator {
		value: number;
	}
	export interface Response {
		[key: string]: { [key: string]: Indicator };
	}
	export interface ApiIndicator {
		collection: string;
		collection_Label: string;
		refarea: string;
		refarea_Label: string;
		indicator: string;
		indicator_Label: string;
		measure: string;
		measure_Label: string;
		classification0: unknown;
		classification0_Label: string;
		classification1: unknown;
		classification1_Label: string;
		classification2: unknown;
		classification2_Label: string;
		classification3: unknown;
		classification3_Label: string;
		classification4: unknown;
		classification4_Label: string;
		classification5: unknown;
		classification5_Label: string;
		source: string;
		source_Lable: string;
		frequency: string;
		frequency_Label: string;
		time_Period: string;
		obs_Value: number;
		upper_Bound: unknown;
		lower_Bound: unknown;
		obs_Status: string;
		obs_Status_Label: string;
		source_Note: string;
		indicator_Note: string;
		classification_Note: string;
		currency: string;
		unitMeasureType: string;
		unitMeasureType_Label: string;
		unitMeasure: string;
		unitMeasure_Label: string;
		unitMultiplier: string;
		unitMultiplier_Label: string;
		decimals: number;
		surveyId: number;
		survey_Label: string;
	}
}
