import pgtools, { Config } from 'pgtools';
import { Logger } from './tools/Logger';
export default class DBChecker {
	logger = new Logger('DBChecker');
	constructor(private readonly config: Config, private readonly dbname: string) {}
	private create() {
		return pgtools.createdb(this.config, this.dbname);
	}
	private drop() {
		return pgtools.dropdb(this.config, this.dbname);
	}
	async checkRemoveAndCreate(): Promise<void> {
		try {
			this.logger.debug('Finding DB', this.dbname);
			await this.drop();
			this.logger.debug('DB', this.dbname, 'droped');
		} catch (error) {
			this.logger.debug("can't drop the DB", this.dbname, '(probably does not exist)');
		}
		await this.create();
		this.logger.debug(`DB ${this.dbname} created`);
		return;
	}
}
