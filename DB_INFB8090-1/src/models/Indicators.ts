import Joi, { AnySchema } from 'joi';
import { Logger } from '../tools/Logger';
import { Model } from './Model';
export class Indicators extends Model {
	private static logger = new Logger('Indicators');
	private static table = `
    CREATE TABLE indicators(
      _id SERIAL PRIMARY KEY,
      _countryid TEXT NOT NULL,
      year SMALLINT NOT NULL,
      data jsonb
    );
    `;
	private static singleInser = `INSERT INTO indicators(_id,data) VALUES($1,$2)`;
	static readonly fkValidator = Joi.string().min(2).max(2);
	static readonly validator = Joi.object({
		PIB: Joi.alternatives(Joi.number(), Joi.allow(true)),
		DBI: Joi.alternatives(Joi.number().min(1), Joi.allow(true)),
		IFL: Joi.alternatives(Joi.number().min(0).max(1), Joi.allow(true)),
		IVA: Joi.alternatives(Joi.number().min(0).max(1), Joi.allow(true)),
		PRF: Joi.alternatives(Joi.number().min(0).max(1), Joi.allow(true)),
		SMI: Joi.alternatives(Joi.number(), Joi.allow(true)),
		TDA: Joi.alternatives(Joi.number().min(0).max(1), Joi.allow(true)),
		TSC: Joi.alternatives(Joi.number(), Joi.allow(true)),
	} as { [key in keyof Indicators.Model]: AnySchema });
	static async create(): Promise<Indicators> {
		await this.client.query(Indicators.table);
		this.logger.debug('Table created');
		return new Indicators();
	}
	private constructor() {
		super();
	}
	async insert(countryId: Indicators._id, data: Indicators.Model): Promise<void> {
		const { error: iError } = Indicators.fkValidator.validate(countryId);
		const { error: cError } = Indicators.validator.validate(data);
		if (iError) throw iError.details;
		if (cError) throw cError.details;
		const client = Indicators.client;
		Indicators.logger.debug('Inserting entry fk to:', countryId);
		Indicators.logger.silly({ countryId, data });
		await client.query(Indicators.singleInser, [countryId, data]);
		return;
	}
	async bulkInsert(entries: Indicators.iEntry[]): Promise<void> {
		const { error } = Joi.array()
			.items(
				Joi.object({
					year: Joi.number().min(1).max(9999),
					_countryid: Indicators.fkValidator,
					data: Indicators.validator,
				} as { [key in keyof Omit<Indicators.Entry, '_id'>]: AnySchema }),
			)
			.validate(entries);
		if (error) throw error.details;
		const cs = new Model.pqp.helpers.ColumnSet(['_countryid', 'year', 'data'], {
			table: 'indicators',
		});
		const query = Model.pqp.helpers.insert(entries, cs);
		await Model.client.none(query);
		return;
	}
}
export namespace Indicators {
	export type _id = string;
	export interface Model {
		PIB: number;
		TDA: number;
		IFL: number;
		IVA: number;
		PRF: number;
		SMI: number;
		TSC: number;
		DBI: number;
	}
	export interface Entry {
		_id: _id;
		_countryid: _id;
		year: number;
		data: Model;
	}
	export type iEntry = Omit<Entry, '_id'>;
}
