import { Guild } from 'discord.js';
import { createRequire } from 'node:module';

import EventHandler from './EventHandler.js';
import Logger from '../services/Logger.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

/**
 * Handle server leave events.
 */
export default class GuildLeaveHandler implements EventHandler {
    public async process(guild: Guild): Promise<void> {
        Logger.info(
            Logs.info.guildLeft
                .replaceAll('{GUILD_NAME}', guild.name)
                .replaceAll('{GUILD_ID}', guild.id)
        );
    }
}
