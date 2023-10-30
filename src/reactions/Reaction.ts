import { Message, MessageReaction, User } from 'discord.js';

import EventData from '../models/EventData.js';

export default interface Reaction {
    emoji: string;
    requireGuild: boolean;
    requireSentByClient: boolean;
    requireEmbedAuthorTag: boolean;
    execute(
        msgReaction: MessageReaction,
        msg: Message,
        reactor: User,
        data: EventData
    ): Promise<void>;
}
