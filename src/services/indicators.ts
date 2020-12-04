import { Indicators } from 'db_infb8090';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { CustomError } from '../controllers/CustomError';
import { DBController } from '../controllers/DBController';

@injectable()
export class IndicatorsService {
	private static readonly indicatorData: IndicatorsService.IndicatorData = {
		PIB: {
			name: 'Producto Interno Bruto',
			unit: 'US$',
		},
		TDA: {
			name: 'Tasa de desempleo anual',
			unit: '%',
		},
		IFL: {
			name: 'Inflación',
			unit: '%',
		},
		IVA: {
			name: 'Impuesto de Valor Añadido',
			unit: '%',
		},
		PRF: {
			name: 'Presión Fiscal',
			unit: '%',
		},
		SMI: {
			name: 'Salario Mínimo',
			unit: 'US$',
		},
		TSC: {
			name: 'Tasa de cambio',
			unit: 'US$ (por unidad)',
		},
		DBI: {
			name: 'Doing Business Index',
			unit: 'Posición en el ranking (menos es mejor)',
		},
	};
	private static formatIndicators(
		indicatorCode: string,
		year: number,
		rawData: Indicators.Model,
	): IndicatorsService.indicators {
		const indicatorData = this.indicatorData[indicatorCode];
		if (!indicatorData)
			throw new CustomError('NOT_FOUND', 'El indicador no se encuentra registrado');
		const indicators: IndicatorsService.indicators = {
			code: indicatorCode,
			name: indicatorData.name,
			unit: indicatorData.unit,
			value: rawData[indicatorCode],
			year,
		};
		return indicators;
	}

	constructor(
		@inject('logger') private logger: Logger,
		@inject(DBController) private DBController: DBController,
	) {}
	async getIndicators<P extends number | { from: number; to: number }>(
		countryCode: string,
		indicatorCode: string,
		period: P,
	): Promise<P extends number ? IndicatorsService.indicators : IndicatorsService.indicators[]> {
		this.logger.silly('indicators getIndicators');
		if (typeof period === 'number') {
			const indicators = await this.DBController.$indicators.fetch(countryCode, period);
			return IndicatorsService.formatIndicators(indicatorCode, period, indicators) as never;
		} else {
			const indicators = await this.DBController.$indicators.list(
				countryCode,
				(period as { from: number; to: number }).from,
				(period as { from: number; to: number }).to,
			);
			return indicators.map((entry) =>
				IndicatorsService.formatIndicators(indicatorCode, entry.year, entry.data),
			) as never;
		}
	}
}
export namespace IndicatorsService {
	export interface indicators {
		code: string;
		name: string;
		unit: string;
		value: number;
		year: number;
	}
	export type IndicatorData = Record<string, { name: string; unit: string }>;
}
