import dotenv from 'dotenv';
const env = dotenv.config();
if (env.error) {
	// This error should crash whole process
	throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
export const PG_HOST = process.env.PG_HOST ? process.env.PG_HOST : 'localhost';
export const PG_PORT = process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432;
export const PG_DATABASE = process.env.PG_DATABASE;
export const PG_USER = process.env.PG_USER;
export const PG_PASSWORD = process.env.PG_PASSWORD;

export const DEBUG = process.env.DEBUG
	? process.env.DEBUG.toLowerCase() === 'true'
		? true
		: false
	: false;
export const LOGS_LEVEL = process.env.LOGS_LEVEL || 'silly';
