#!/usr/bin/env node
import semver from 'semver';
import { PG_DATABASE, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from './config';
import DBChecker from './DBChecker';
import { Countries } from './models/Countries';
import { Indicators } from './models/Indicators';
import { Ilo } from './sources/Ilo';
import { RestCountries } from './sources/RestCountries';
import { WorldBank } from './sources/WorldBank';
import { Logger } from './tools/Logger';
export * from './models/Countries';
const logger = new Logger('main');
function countriesParser(countries: RestCountries.Model[]): Countries.Entry[] {
	return countries.map((country) => ({
		_id: country.alpha2Code,
		data: {
			countryName: country.name,
			currencyName: country.currencies[0].name,
			iso_3166_1_alpha_3: country.alpha3Code,
			iso_4217: country.currencies.find(
				(currency) => currency.code && currency.code.toLowerCase() != '(none)',
			).code,
			iso_639_1: country.languages.map((lang) => lang.iso639_1).join(', '),
		},
	}));
}
async function main(config: Config) {
	const { host, database, password, port, user } = config;
	const countriesApi = new RestCountries();
	const worldBankApi = new WorldBank();
	const iloApi = new Ilo();
	const totalErrorCountries: { CountryIso2Code: string; name: string }[] = [];
	let totalCountries = 0;
	let totalIndicators = 0;
	logger.info('🏁 Started');
	const dbChecker = new DBChecker({ host, password, port, user }, database);
	if (semver.lt(process.version, '14.0.0')) {
		logger.log('Creating DB', database);
		await dbChecker.checkRemoveAndCreate();
	} else logger.info(`Cannot create the database with this version of node (${process.version})`);
	logger.log('Creating table countries');
	const countries = await Countries.create();
	logger.log('Creating table indicators');
	const indicators = await Indicators.create();
	logger.log('Obtaining countries from RestCountries');
	const apiCountries = await countriesApi.list();
	const parsedCountries = countriesParser(apiCountries);
	totalCountries = parsedCountries.length;
	await countries.bulkInsert(parsedCountries);
	logger.log('Obtaining minimum wages');
	const smiAll = await iloApi.findSMI(1960, 2020);
	logger.log('Obtaining countries info');
	await Promise.all(
		parsedCountries.map(async (country) => {
			try {
				const countryIso2Code = country._id;
				const countryData = await worldBankApi.find(countryIso2Code);
				logger.log('Merging sources from iloApi to', countryIso2Code);
				const models: Indicators.iEntry[] = Object.entries(countryData).map((c) => {
					const year = Number(c[0]);
					const tsc = c[1].TSC;
					const countryIso3Code = apiCountries.find(
						(country) => country.alpha2Code === countryIso2Code,
					).alpha3Code;
					if (smiAll[year] && smiAll[year][countryIso3Code]) {
						const SMI = smiAll[year][countryIso3Code].value / tsc;
						countryData[year].SMI = SMI;
					}
					totalIndicators += 1;
					return {
						_countryid: countryIso2Code,
						year,
						data: c[1],
					};
				});
				await indicators.bulkInsert(models);
			} catch (error) {
				totalErrorCountries.push({
					CountryIso2Code: country._id,
					name: country.data.countryName,
				});
				logger.info('No indicators were found for', country._id);
			}
		}),
	);
	if (Logger.canLog) console.log('\n');
	logger.log('⚠️ No indicators were found for the following countries');
	if (Logger.canLog) {
		console.table(totalErrorCountries);
		console.log('\n');
	}
	logger.info(
		`Done 🎉, ${totalCountries} countries and ${totalIndicators} indicators were added`,
	);
}
export interface Config {
	host: string;
	port: number;
	database: string;
	user: string;
	password: string;
}
main({
	host: PG_HOST,
	port: PG_PORT,
	database: PG_DATABASE,
	user: PG_USER,
	password: PG_PASSWORD,
})
	.then(() => {
		logger.log('process end');
		process.exit(0);
	})
	.catch((error) => {
		logger.log('fatal error');
		console.error(error);
		process.exit(1);
	});
