import djs, { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { createRequire } from 'node:module';
import os from 'node:os';
import typescript from 'typescript';

import { Language } from '../../models/enum-helpers/language.js';
import { EventData } from '../../models/internal-models.js';
import Lang from '../../services/Lang.js';
import { FormatUtils } from '../../utils/format-utils.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';
import Command, { CommandDeferType } from '../Command.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');
let TsConfig = require('../../../tsconfig.json');

export enum DevCommandName {
    INFO = 'INFO',
}

/**
 * A chat slash command that provides information about the bot.
 */
export default class DevCommand implements Command {
    public names = [Lang.getRef('chatCommands.dev', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        if (!Config.developers.includes(intr.user.id)) {
            await InteractionUtils.send(intr, Lang.getEmbed('validationEmbeds.devOnly', data.lang));
            return;
        }

        let args = {
            option: intr.options.getString(
                Lang.getRef('arguments.devOption', Language.Default)
            ) as DevCommandName,
        };

        switch (args.option) {
            case DevCommandName.INFO: {
                // Option argument is info, show info about the server environment
                let serverCount = intr.client.guilds.cache.size;

                let memory = process.memoryUsage();

                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('displayEmbeds.devInfo', data.lang, {
                        NODE_VERSION: process.version,
                        TS_VERSION: `v${typescript.version}`,
                        ES_VERSION: TsConfig.compilerOptions.target,
                        DJS_VERSION: `v${djs.version}`,
                        SERVER_COUNT: serverCount.toLocaleString(data.lang),
                        RSS_SIZE: FormatUtils.fileSize(memory.rss),
                        RSS_SIZE_PER_SERVER:
                            serverCount > 0
                                ? FormatUtils.fileSize(memory.rss / serverCount)
                                : Lang.getRef('other.na', data.lang),
                        HEAP_TOTAL_SIZE: FormatUtils.fileSize(memory.heapTotal),
                        HEAP_TOTAL_SIZE_PER_SERVER:
                            serverCount > 0
                                ? FormatUtils.fileSize(memory.heapTotal / serverCount)
                                : Lang.getRef('other.na', data.lang),
                        HEAP_USED_SIZE: FormatUtils.fileSize(memory.heapUsed),
                        HEAP_USED_SIZE_PER_SERVER:
                            serverCount > 0
                                ? FormatUtils.fileSize(memory.heapUsed / serverCount)
                                : Lang.getRef('other.na', data.lang),
                        HOSTNAME: os.hostname(),
                        SHARD_ID: (intr.guild?.shardId ?? 0).toString(),
                        SERVER_ID: intr.guild?.id ?? Lang.getRef('other.na', data.lang),
                        BOT_ID: intr.client.user?.id,
                        USER_ID: intr.user.id,
                    })
                );
                break;
            }
            default: {
                return;
            }
        }
    }
}
