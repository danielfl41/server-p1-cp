import { Countries } from 'db_infb8090';
export class CountriesController {
	async fetch(_id: Countries._id): Promise<Countries.Model> {
		const response = await Countries.client.query<Omit<Countries.Entry, '_id'>[]>(
			'SELECT data FROM countries WHERE _id=$1;',
			_id,
		);
		if (response.length === 0) throw new Error('not found');
		else return response[0].data;
	}
	async list(): Promise<Countries.Entry[]> {
		const response = await Countries.client.query<Countries.Entry[]>(
			'SELECT * FROM countries;',
		);
		return response;
	}
}
