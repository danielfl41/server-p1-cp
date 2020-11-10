import { Container } from 'typedi';
import LoggerInstance from './logger';
export default (() => {
	Container.set('logger', LoggerInstance);
}) as () => void;
