import { Router } from 'express';
import countries from './countries';
import indicators from './indicators';
export default (): Router => {
	const app = Router();
	countries(app);
	indicators(app);
	return app;
};
