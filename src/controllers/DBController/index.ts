import { injectable } from 'tsyringe';
import { CountriesController } from './Countries';
import { IndicatorsController } from './Indicators';

@injectable()
export class DBController {
	readonly $countries = new CountriesController();
	readonly $indicators = new IndicatorsController();
}
