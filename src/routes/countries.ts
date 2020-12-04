import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { container } from 'tsyringe';
import { Logger } from 'winston';
import { ResponseHandler } from '../controllers/ResponseHandler';
import { isAuth } from '../middlewares/isAuth';
import { CountriesService } from '../services/countries';
const route = Router();
export default (app: Router): void => {
	app.use('/countries', route);
	route.get('/all', isAuth, async (req, res) => {
		const logger = container.resolve<Logger>('logger');
		logger.debug('Calling countries all');
		const response = new ResponseHandler(res);
		try {
			const countriesServiceI = container.resolve(CountriesService);
			const list = await countriesServiceI.getAll();
			return response.ok(list);
		} catch (error) {
			logger.error('🔥 error: %o', error);
			if (error.isCustom) return response.errorFromCustom(error);
			else return response.error(500, null);
		}
	});
	route.get(
		'/:code/info',
		isAuth,
		celebrate({
			params: Joi.object({
				code: Joi.string().required().min(2).max(2),
			}),
		}),
		async (req, res) => {
			const logger = container.resolve<Logger>('logger');
			logger.debug('Calling countries info %o', req.params['code']);
			const response = new ResponseHandler(res);
			try {
				let { code } = req.params;
				code = code.toUpperCase();
				const countriesService = container.resolve(CountriesService);
				const country = await countriesService.getCountry(code);
				return response.ok(country);
			} catch (error) {
				logger.error('🔥 error: %o', error);
				if (error.isCustom) return response.errorFromCustom(error);
				else return response.error(500, null);
			}
		},
	);
};
