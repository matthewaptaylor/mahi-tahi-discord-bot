import { Message } from 'discord.js';

import EventHandler from './EventHandler.js';
import TriggerHandler from './TriggerHandler.js';

/**
 * Handle message events.
 */
export default class MessageHandler implements EventHandler {
    constructor(private triggerHandler: TriggerHandler) {}

    public async process(msg: Message): Promise<void> {
        // Don't respond to system messages or self
        if (msg.system || msg.author.id === msg.client.user?.id) {
            return;
        }

        // Process trigger
        await this.triggerHandler.process(msg);
    }
}
