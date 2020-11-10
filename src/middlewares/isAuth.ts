import { RequestHandler } from 'express';
import { API_APP, API_KEY } from '../config';

export const isAuth: RequestHandler = async (req, res, next) => {
	const apiApp = req.headers['x-api-app'];
	const apiKey = req.headers['x-api-key'];
	if (!apiApp || !apiKey) {
		return res
			.set({
				'WWW-Authenticate': `Basic realm="Api"`,
			})
			.sendStatus(401);
	}

	if (apiApp !== API_APP || apiKey !== API_KEY) return res.sendStatus(403);
	return next();
};
