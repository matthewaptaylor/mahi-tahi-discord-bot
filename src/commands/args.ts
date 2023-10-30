import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';

import { DevCommandName } from './chat/DevCommand.js';
import { HelpOption } from './chat/HelpCommand.js';
import { Language } from '../models/enum-helpers/language.js';
import { Lang } from '../services/lang.js';

/**
 * Slash command argument declarations.
 */
export default class Args {
    /**
     * Option argument for the dev command.
     */
    public static readonly DEV_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.devOption', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.devOption'),
        description: Lang.getRef('argDescs.devOption', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.devOption'),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('devOption.info', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('devOption.info'),
                value: DevCommandName.INFO,
            },
        ],
    };

    /**
     * Option argument for the help command.
     */
    public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.helpOption', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.helpOption'),
        description: Lang.getRef('argDescs.helpOption', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('helpOption.commands', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('helpOption.commands'),
                value: HelpOption.COMMANDS,
            },
            {
                name: Lang.getRef('helpOption.about', Language.Default),
                name_localizations: Lang.getRefLocalizationMap('helpOption.about'),
                value: HelpOption.ABOUT,
            },
        ],
    };
}
