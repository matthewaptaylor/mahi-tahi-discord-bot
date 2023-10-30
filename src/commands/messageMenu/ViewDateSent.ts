import { MessageContextMenuCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { DateTime } from 'luxon';

import { Language } from '../../models/enum-helpers/language.js';
import { EventData } from '../../models/internal-models.js';
import Lang from '../../services/Lang.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';
import Command, { CommandDeferType } from '../Command.js';

/**
 * A message context menu item that displays the date the message was sent.
 */
export default class ViewDateSent implements Command {
    public names = [Lang.getRef('messageMenuCommands.viewDateSent', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(
        intr: MessageContextMenuCommandInteraction,
        data: EventData
    ): Promise<void> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('displayEmbeds.viewDateSent', data.lang, {
                DATE: DateTime.fromJSDate(intr.targetMessage.createdAt).toLocaleString(
                    DateTime.DATE_HUGE
                ),
            })
        );
    }
}
