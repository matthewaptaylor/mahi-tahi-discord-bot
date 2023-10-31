import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { login } from 'mahi-tahi-api';
import { createRequire } from 'node:module';

import Language from '../../models/enumHelpers/Language.js';
import EventData from '../../models/EventData.js';
import Lang from '../../services/Lang.js';
import EventManagementUtils from '../../utils/EventManagementUtils.js';
import InteractionUtils from '../../utils/InteractionUtils.js';
import MahiTahiUtils from '../../utils/MahiTahiUtils.js';
import Command, { CommandDeferType } from '../Command.js';

const require = createRequire(import.meta.url);
let Data = require('../../../config/data.json');

export enum ReloadOption {
    FORUM = 'FORUM',
    ABOUT = 'ABOUT',
}

export default class ReloadCommand implements Command {
    public names = [Lang.getRef('chatCommands.reload', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            option: intr.options.getString(
                Lang.getRef('arguments.reloadOption', Language.Default)
            ) as ReloadOption,
        };

        let embed: EmbedBuilder;
        switch (args.option) {
            case ReloadOption.FORUM: {
                const currentYear = new Date().getFullYear();

                // Request year events from Mahi Tahi
                const credentials = await login(
                    Data.mahiTahiCredentials.username,
                    Data.mahiTahiCredentials.password
                );
                const eventsInYear = await MahiTahiUtils.getEventsInYear(
                    credentials,
                    currentYear,
                    Data.mahiTahiGroup
                );

                await EventManagementUtils.createEventPlanningThreads(intr.client, eventsInYear);

                embed = Lang.getEmbed('displayEmbeds.reloadForum', data.lang);
                break;
            }
            default: {
                return;
            }
        }

        await InteractionUtils.send(intr, embed);
    }
}
