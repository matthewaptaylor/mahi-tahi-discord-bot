import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import Language from '../../models/enumHelpers/Language.js';
import EventData from '../../models/EventData.js';
import Lang from '../../services/Lang.js';
import ClientUtils from '../../utils/ClientUtils.js';
import FormatUtils from '../../utils/FormatUtils.js';
import InteractionUtils from '../../utils/InteractionUtils.js';
import Command, { CommandDeferType } from '../Command.js';

export enum HelpOption {
    COMMANDS = 'COMMANDS',
    ABOUT = 'ABOUT',
}

export default class HelpCommand implements Command {
    public names = [Lang.getRef('chatCommands.help', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            option: intr.options.getString(
                Lang.getRef('arguments.helpOption', Language.Default)
            ) as HelpOption,
        };

        let embed: EmbedBuilder;
        switch (args.option) {
            case HelpOption.COMMANDS: {
                embed = Lang.getEmbed('displayEmbeds.helpCommands', data.lang, {
                    CMD_LINK_HELP: FormatUtils.commandMention(
                        await ClientUtils.findAppCommand(
                            intr.client,
                            Lang.getRef('chatCommands.help', Language.Default)
                        )
                    ),
                });
                break;
            }
            case HelpOption.ABOUT: {
                embed = Lang.getEmbed('displayEmbeds.about', data.lang);
                break;
            }
            default: {
                return;
            }
        }

        await InteractionUtils.send(intr, embed);
    }
}
