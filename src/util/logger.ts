import winston from 'winston';
import { Logger } from 'winston';
import { dev } from './secrets';

const logger = new (Logger)({
  transports: [
    new (winston.transports.Console)({ level: dev ? 'debug' : 'error' }),
    // new (winston.transports.File)({ filename: 'debug.log', level: 'debug' })
  ]
});

if (dev) {
  logger.debug('Logging initialized at debug level');
}

export default logger;

