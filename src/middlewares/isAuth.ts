import { RequestHandler } from 'express';
import { API_APP, API_KEY } from '../config';
import { ResponseHandler } from '../controllers/ResponseHandler';

export const isAuth: RequestHandler = async (req, res, next) => {
	const apiApp = req.headers['x-api-app'];
	const apiKey = req.headers['x-api-key'];
	const response = new ResponseHandler(res);
	if (!apiApp || !apiKey) {
		res.set({
			'WWW-Authenticate': `Basic realm="Api"`,
		});
		return response.error(401, 'No está autorizado a consumir este servicio');
	}

	if (apiApp !== API_APP || apiKey !== API_KEY)
		return response.error(
			403,
			'Las credenciales proporcionadas no permiten consumir este servicio',
		);
	return next();
};
