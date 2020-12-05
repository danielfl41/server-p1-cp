import { DEBUG, LOGS_LEVEL } from '../config';

export class Logger {
	static levels: { [key: string]: number } = {
		error: 0,
		warn: 1,
		info: 2,
		log: 3,
		verbose: 4,
		debug: 5,
		silly: 6,
	};
	static get canError(): boolean {
		return this.levels[LOGS_LEVEL] >= this.levels.error;
	}
	static get canInfo(): boolean {
		return this.levels[LOGS_LEVEL] >= this.levels.info;
	}
	static get canLog(): boolean {
		return this.levels[LOGS_LEVEL] >= this.levels.log;
	}
	static get canDebug(): boolean {
		return this.levels[LOGS_LEVEL] >= this.levels.debug;
	}
	static get canSilly(): boolean {
		return this.levels[LOGS_LEVEL] >= this.levels.silly;
	}
	constructor(private readonly scope: string) {}
	error(...c: unknown[]): void {
		if (DEBUG && Logger.canError) console.error('❌', `[${this.scope}]	`, ...c);
	}
	info(...c: unknown[]): void {
		if (Logger.canInfo) console.log('ℹ️ ', `[${this.scope}]	`, ...c);
	}
	log(...c: unknown[]): void {
		if (DEBUG && Logger.canLog) console.log('> ', `[${this.scope}]	`, ...c);
	}
	debug(...c: unknown[]): void {
		if (DEBUG && Logger.canDebug) console.debug('🐞', `[${this.scope}]	`, ...c);
	}
	silly(...c: unknown[]): void {
		if (DEBUG && Logger.canSilly) console.debug('📜', `[${this.scope}]\n`, ...c);
	}
}
