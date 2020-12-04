import bodyParser from 'body-parser';
import { isCelebrateError } from 'celebrate';
import cors from 'cors';
import express from 'express';
import { API_VERSION, ENDPOINT_API } from '../config';
import { ResponseHandler } from '../controllers/ResponseHandler';
import routes from '../routes';

export default ({ app }: { app: express.Application }): void => {
	/**
	 * Health Check endpoints
	 * @TODO Explain why they are here
	 */
	app.get('/status', (req, res) => {
		res.status(200).end();
	});
	app.head('/status', (req, res) => {
		res.status(200).end();
	});

	// Enable Cross Origin Resource Sharing to all origins by default
	app.use(cors());

	// Middleware that transforms the raw string of req.body into json
	app.use(bodyParser.json());

	// Load API routes
	app.use(ENDPOINT_API + API_VERSION, routes());

	/// catch 404 and forward to error handler
	app.use((req, res, next) => {
		const err = new Error('Not Found');
		res.status(404);
		next(err);
	});

	/// error handlers
	app.use((err, req, res, next) => {
		const response = new ResponseHandler(res);
		// Handle 401 thrown by express-jwt library
		if (err.name === 'UnauthorizedError') {
			return response.error(err.status, err.message);
		}

		// Handle 401 thrown by Celebrate
		if (isCelebrateError(err)) {
			let message = '';
			err.details.forEach((entry) => {
				const msg = entry.message;
				message += ', ' + msg;
			});
			return response.error(400, `La petición es inválida`, message.slice(2));
		}
		return next(err);
	});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err, req, res, next) => {
		const response = new ResponseHandler(res);
		if (err.isCustom) return response.errorFromCustom(err);
		else return response.error(err.status || 500, 'Error interno del servidor', err.message);
	});
};
