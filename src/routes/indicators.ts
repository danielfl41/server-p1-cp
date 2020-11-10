import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';
import { isAuth } from '../middlewares/isAuth';
import { IndicatorsService } from '../services/indicators';
const route = Router();
export default (app: Router) => {
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
		async (req, res, next) => {
			const logger: Logger = Container.get('logger');
			logger.debug('Calling indicators %o', req.params);
			try {
				const {
					countryCode,
					indicatorCode,
					year,
				}: { countryCode?: string; indicatorCode?: string; year?: number } = req.params;
				const indicatorsService = Container.get(IndicatorsService);
				const indicators = await indicatorsService.getIndicators(
					countryCode,
					indicatorCode,
					year,
				);
				return res.json({ data: indicators }).status(200);
			} catch (error) {
				logger.error('🔥 error: %o', error);
				return next(error);
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
		async (req, res, next) => {
			const logger: Logger = Container.get('logger');
			logger.debug('Calling indicators info with: %o', req.body);
			try {
				const {
					countryCode,
					indicatorCode,
					startYear,
					endYear,
				}: Partial<{
					countryCode: string;
					indicatorCode: string;
					startYear: number;
					endYear: number;
				}> = req.body;
				const indicatorsService = Container.get(IndicatorsService);
				const indicators = await indicatorsService.getIndicators(
					countryCode,
					indicatorCode,
					{ from: startYear, to: endYear },
				);
				return res.json({ data: indicators }).status(200);
			} catch (error) {
				logger.error('🔥 error: %o', error);
				return next(error);
			}
		},
	);
};
