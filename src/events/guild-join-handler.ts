import { Guild } from 'discord.js';
import { createRequire } from 'node:module';

import { EventHandler } from './event-handler.js';
import { EventDataService } from '../services/event-data-service.js';
import { Logger } from '../services/logger.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class GuildJoinHandler implements EventHandler {
    constructor(private eventDataService: EventDataService) {}

    public async process(guild: Guild): Promise<void> {
        Logger.info(
            Logs.info.guildJoined
                .replaceAll('{GUILD_NAME}', guild.name)
                .replaceAll('{GUILD_ID}', guild.id)
        );
    }
}
