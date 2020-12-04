import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { ResponseHandler } from '../controllers/ResponseHandler';
import { isAuth } from '../middlewares/isAuth';
import { CountriesService } from '../services/countries';
import { IndicatorsService } from '../services/indicators';
const route = Router();
export default (app: Router): void => {
	app.use('/indicators', route);
	route.get(
		'/:countryCode/:indicatorCode/:year/info',
		isAuth,
		celebrate({
			params: Joi.object({
				countryCode: Joi.string().min(2).max(2),
				indicatorCode: Joi.string().min(3).max(3),
				year: Joi.number().min(1).max(3000),
			}),
		}),
		async (req, res) => {
			const logger = container.resolve<Logger>('logger');
			logger.debug('Calling indicators %o', req.params);
			const response = new ResponseHandler(res);
			try {
				let {
					countryCode,
					indicatorCode,
					// eslint-disable-next-line prefer-const
					year,
				}: { countryCode?: string; indicatorCode?: string; year?: number } = req.params;
				countryCode = countryCode.toUpperCase();
				indicatorCode = indicatorCode.toUpperCase();
				const countriesService = container.resolve(CountriesService);
				const indicatorsService = container.resolve(IndicatorsService);
				let indicators: IndicatorsService.indicators;
				let country: CountriesService.Country;
				await Promise.all([
					indicatorsService
						.getIndicators(countryCode, indicatorCode, year)
						.then((_indicators) => (indicators = _indicators)),
					countriesService
						.getCountry(countryCode)
						.then((_country) => (country = _country)),
				]);
				return response.ok({ ...indicators, country });
			} catch (error) {
				logger.error('🔥 error: %o', error);
				if (error.isCustom) return response.errorFromCustom(error);
				else return response.error(500, null);
			}
		},
	);
	route.post(
		'/info',
		isAuth,
		celebrate({
			body: Joi.object({
				countryCode: Joi.string().required().min(2).max(2),
				indicatorCode: Joi.string().required().min(3).max(3),
				startYear: Joi.number().required().min(1).max(2999),
				endYear: Joi.alternatives().try(
					Joi.number().max(3000).greater(Joi.ref('startYear')),
					Joi.number().max(3000).equal(Joi.ref('startYear')),
				),
			}),
		}),
		async (req, res) => {
			const logger = container.resolve<Logger>('logger');
			logger.debug('Calling indicators info with: %o', req.body);
			const response = new ResponseHandler(res);
			try {
				let {
					countryCode,
					indicatorCode,
					// eslint-disable-next-line prefer-const
					startYear,
					// eslint-disable-next-line prefer-const
					endYear,
				}: Partial<{
					countryCode: string;
					indicatorCode: string;
					startYear: number;
					endYear: number;
				}> = req.body;

				countryCode = countryCode.toUpperCase();
				indicatorCode = indicatorCode.toUpperCase();
				const countriesService = container.resolve(CountriesService);
				const indicatorsService = container.resolve(IndicatorsService);

				let indicators: IndicatorsService.indicators[];
				let country: CountriesService.Country;

				await Promise.all([
					indicatorsService
						.getIndicators(countryCode, indicatorCode, { from: startYear, to: endYear })
						.then((_indicators) => (indicators = _indicators)),
					countriesService
						.getCountry(countryCode)
						.then((_country) => (country = _country)),
				]);
				const toReturn = indicators.map((indicator) => ({ ...indicator, country }));
				return response.ok(toReturn);
			} catch (error) {
				logger.error('🔥 error: %o', error);
				if (error.isCustom) return response.errorFromCustom(error);
				else return response.error(500, null);
			}
		},
	);
};
