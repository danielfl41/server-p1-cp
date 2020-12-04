import { Countries, Indicators } from 'db_infb8090';

export class IndicatorsController {
	async fetch(countryCode: Countries._id, year: number): Promise<Indicators.Model> {
		const response = await Indicators.client.query<Pick<Indicators.Entry, 'data'>[]>(
			'select data from indicators where _countryid=$1 and year=$2;',
			[countryCode, year],
		);
		if (response.length === 0) throw new Error('not found');
		else return response[0].data;
	}
	async list(
		countryCode: Countries._id,
		minYear: number,
		maxYear: number,
	): Promise<Indicators.Entry[]> {
		const response = await Indicators.client.query<Indicators.Entry[]>(
			'select * from indicators where _countryid=$1 and year>=$2 and year<=$3;',
			[countryCode, minYear, maxYear],
		);
		return response;
	}
}
