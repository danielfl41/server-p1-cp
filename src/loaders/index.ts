import dependencyInjectorLoader from './dependencyInjector';
import expressLoader from './express';
import Logger from './logger';
export default async ({ app }) => {
	dependencyInjectorLoader();

	expressLoader({ app });
	Logger.info('✌️ Express loaded');
};
