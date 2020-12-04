declare module 'pgtools' {
	export interface Config {
		user: string;
		password: string;
		port: number;
		host: string;
	}
	type callback = (err: Error, res: unknown) => void;
	/**
	 * Create a DB
	 *
	 * @param {object } config object with user, password, port, and host properties. This can also be a node-postgres compatible connection string.
	 * @param {string} dbname The name of the database to create.
	 */
	export function createdb(config: Config, name: string): Promise<void>;
	/**
	 * Drop a DB
	 *
	 * @param {object } config object with user, password, port, and host properties. This can also be a node-postgres compatible connection string.
	 * @param {string} dbname The name of the database to create.
	 */
	export function dropdb(config: Config, name: string): Promise<void>;
}
