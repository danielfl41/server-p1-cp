import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';
import { isAuth } from '../middlewares/isAuth';
import { CountriesService } from '../services/countries';
const route = Router();
export default (app: Router) => {
	app.use('/countries', route);
	route.get('/all', isAuth, async (req, res, next) => {
		const logger: Logger = Container.get('logger');
		logger.debug('Calling countries all');
		try {
			const countriesServiceI = Container.get(CountriesService);
			const list = await countriesServiceI.getAll();
			return res.json({ data: list }).status(200);
		} catch (error) {
			logger.error('🔥 error: %o', error);
			return next(error);
		}
	});
	route.get(
		'/:code/info',
		isAuth,
		celebrate({
			params: Joi.object({
				code: Joi.string().min(2).max(2),
			}),
		}),
		async (req, res, next) => {
			const logger: Logger = Container.get('logger');
			logger.debug('Calling countries info %o', req.params['code']);
			try {
				const { code } = req.params;
				const countriesService = Container.get(CountriesService);
				const country = await countriesService.getCountry(code);
				return res.json({ data: country }).status(200);
			} catch (error) {
				logger.error('🔥 error: %o', error);
				return next(error);
			}
		},
	);
};
