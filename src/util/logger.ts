import { Signale, DefaultMethods } from 'signale';

export const logger = new Signale({
  interactive: false
});

logger.config({ 
  displayTimestamp: true,
  underlineLabel: false
});