import { Message } from 'discord.js';

import { EventData } from '../models/internal-models.js';

/**
 * Interface for a trigger, which is a class that handles a specific type of message.
 */
export default interface Trigger {
    requireGuild: boolean;
    triggered(msg: Message): boolean;
    execute(msg: Message, data: EventData): Promise<void>;
}
