import {
    ApplicationCommandType,
    PermissionFlagsBits,
    PermissionsBitField,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

import Args from './Args.js';
import Language from '../models/enumHelpers/Language.js';
import Lang from '../services/Lang.js';

/**
 * Metadata describing the bot's commands.
 */
export default class CommandMetadata {
    /**
     * Slash command metadata.
     */
    public static readonly ChatCommands: {
        [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
    } = {
        DEV: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.dev', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.dev'),
            description: Lang.getRef('commandDescs.dev', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.dev'),
            dm_permission: true,
            default_member_permissions: PermissionsBitField.resolve([
                PermissionFlagsBits.Administrator,
            ]).toString(),
            options: [
                {
                    ...Args.DEV_OPTION,
                    required: true,
                },
            ],
        },

        HELP: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.help', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
            description: Lang.getRef('commandDescs.help', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.help'),
            dm_permission: true,
            default_member_permissions: undefined,
            options: [
                {
                    ...Args.HELP_OPTION,
                    required: true,
                },
            ],
        },

        RELOAD: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.reload', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
            description: Lang.getRef('commandDescs.reload', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.reload'),
            dm_permission: true,
            default_member_permissions: undefined,
            options: [
                {
                    ...Args.RELOAD_OPTION,
                    required: true,
                },
            ],
        },
    };

    /**
     * Message context menu command metadata.
     */
    public static readonly MessageMenuCommands: {
        [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
    } = {
        VIEW_DATE_SENT: {
            type: ApplicationCommandType.Message,
            name: Lang.getRef('messageMenuCommands.viewDateSent', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('messageMenuCommands.viewDateSent'),
            default_member_permissions: undefined,
            dm_permission: true,
        },
    };

    /**
     * User context menu command metadata.
     */
    public static readonly UserMenuCommands: {
        [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
    } = {
        VIEW_DATE_JOINED: {
            type: ApplicationCommandType.User,
            name: Lang.getRef('userMenuCommands.viewDateJoined', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('userMenuCommands.viewDateJoined'),
            default_member_permissions: undefined,
            dm_permission: true,
        },
    };
}
