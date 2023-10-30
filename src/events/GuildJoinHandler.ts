import { Guild } from 'discord.js';
import { createRequire } from 'node:module';

import EventHandler from './EventHandler.js';
import EventDataService from '../services/EventDataService.js';
import Logger from '../services/Logger.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

/**
 * Handle server join events.
 */
export default class GuildJoinHandler implements EventHandler {
    constructor(private eventDataService: EventDataService) {}

    public async process(guild: Guild): Promise<void> {
        Logger.info(
            Logs.info.guildJoined
                .replaceAll('{GUILD_NAME}', guild.name)
                .replaceAll('{GUILD_ID}', guild.id)
        );
    }
}
