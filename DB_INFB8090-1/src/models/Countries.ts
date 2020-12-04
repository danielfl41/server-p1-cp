import Joi, { AnySchema } from 'joi';
import { Logger } from '../tools/Logger';
import { Model } from './Model';
export class Countries extends Model {
	private static logger = new Logger('Countries');
	private static table = `
    CREATE TABLE countries(
      _id TEXT PRIMARY KEY NOT NULL,
      data jsonb
    );
    `;
	private static singleInser = `INSERT INTO countries(_id,data) VALUES($1,$2)`;
	static readonly idValidator = Joi.string().min(2).max(2);
	static readonly validator = Joi.object({
		iso_3166_1_alpha_3: Joi.string().min(3).max(3).uppercase(),
		iso_639_1: Joi.string()
			.pattern(/^([a-z]{2}, )*([a-z]{2})$/)
			.empty(''),
		countryName: Joi.string(),
		currencyName: Joi.string(),
		iso_4217: Joi.string().min(3).max(3).uppercase(),
	} as { [key in keyof Countries.Model]: AnySchema });
	static async create(): Promise<Countries> {
		await this.client.query(Countries.table);
		this.logger.debug('Table created');
		return new Countries();
	}
	private constructor() {
		super();
	}
	async insert(id: Countries._id, data: Countries.Model): Promise<void> {
		const { error: iError } = Countries.idValidator.validate(id);
		const { error: cError } = Countries.validator.validate(data);
		if (iError) throw iError.details;
		if (cError) throw cError.details;
		const client = Countries.client;
		Countries.logger.debug('Inserting entry with id:', id);
		Countries.logger.silly({ id, data });
		await client.query(Countries.singleInser, [id, data]);
		return;
	}
	async bulkInsert(entries: Countries.Entry[]): Promise<void> {
		const { error } = Joi.array()
			.items(
				Joi.object({
					_id: Countries.idValidator,
					data: Countries.validator,
				} as { [key in keyof Countries.Entry]: AnySchema }),
			)
			.validate(entries);
		if (error) throw error.details;
		const cs = new Model.pqp.helpers.ColumnSet(['_id', 'data'], { table: 'countries' });
		const query = Model.pqp.helpers.insert(entries, cs);
		await Model.client.none(query);
		return;
	}
}
export namespace Countries {
	export type _id = string;
	export interface Model {
		iso_3166_1_alpha_3: string;
		iso_639_1: string;
		iso_4217: string;
		countryName: string;
		currencyName: string;
	}
	export interface Entry {
		_id: _id;
		data: Model;
	}
}
