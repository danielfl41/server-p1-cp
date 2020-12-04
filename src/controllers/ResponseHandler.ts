import { Response } from 'express';
import { CustomError } from './CustomError';
export class ResponseHandler {
	static customErrorList: ResponseHandler.CustomErrorList = {
		NOT_FOUND: 404,
		UNKNOWN: 500,
	};
	static errors: ResponseHandler.Errors = {
		400: 'La petición es inválida',
		401: 'No está autorizado a consumir este servicio',
		403: 'Las credenciales proporcionadas no permiten consumir este servicio',
		404: 'No encontrado',
		412: 'Ocurrió un error de validación',
		500: 'Error interno del servidor',
	};
	constructor(private readonly res: Response) {}
	ok(data: unknown): ResponseHandler.JSONReturn {
		return this.res.status(200).json({ data });
	}
	errorFromCustom(customError: CustomError): ResponseHandler.JSONReturn {
		const code = ResponseHandler.customErrorList[customError.type];
		const message = customError.message ? customError.message : ResponseHandler.errors[code];
		return this.error(code, message);
	}
	error(
		code: ResponseHandler.code,
		message: string,
		...data: unknown[]
	): ResponseHandler.JSONReturn {
		const error = ResponseHandler.errors[code];
		const estructure: ResponseHandler.ErrorStructure = {
			code: code,
			message: message ? message : error ? error : 'Error',
			data: data.length > 0 ? data : undefined,
		};
		return this.res.status(code).json(estructure);
	}
}
export namespace ResponseHandler {
	export type JSONReturn = ReturnType<Response['json']>;
	export type code = number;
	export type Errors = Record<number, string>;
	export type CustomErrorList = Record<CustomError.type, number>;
	export interface ErrorStructure {
		code: code;
		message: string;
		data: unknown;
	}
}
