import { DMChannel, PermissionsString, UserContextMenuCommandInteraction } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { DateTime } from 'luxon';

import Language from '../../models/enumHelpers/Language.js';
import EventData from '../../models/EventData.js';
import Lang from '../../services/Lang.js';
import InteractionUtils from '../../utils/InteractionUtils.js';
import Command, { CommandDeferType } from '../Command.js';

/**
 * A user context menu item that displays the date the user joined the server.
 */
export default class ViewDateJoined implements Command {
    public names = [Lang.getRef('userMenuCommands.viewDateJoined', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: UserContextMenuCommandInteraction, data: EventData): Promise<void> {
        let joinDate: Date;
        if (!(intr.channel instanceof DMChannel)) {
            let member = await intr.guild.members.fetch(intr.targetUser.id);
            joinDate = member.joinedAt;
        } else joinDate = intr.targetUser.createdAt;

        await InteractionUtils.send(
            intr,
            Lang.getEmbed('displayEmbeds.viewDateJoined', data.lang, {
                TARGET: intr.targetUser.toString(),
                DATE: DateTime.fromJSDate(joinDate).toLocaleString(DateTime.DATE_HUGE),
            })
        );
    }
}
