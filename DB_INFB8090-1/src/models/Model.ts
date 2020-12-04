import oPqp from 'pg-promise';
import { PG_DATABASE, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from '../config';
export class Model {
	public static readonly pqp = oPqp();
	public static readonly client = Model.pqp({
		user: PG_USER,
		host: PG_HOST,
		database: PG_DATABASE,
		password: PG_PASSWORD,
		port: PG_PORT,
	});
}
