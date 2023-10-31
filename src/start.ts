import { REST } from '@discordjs/rest';
import { Options, Partials } from 'discord.js';
import { createRequire } from 'node:module';

import Button from './buttons/Button.js';
import DevCommand from './commands/chat/DevCommand.js';
import HelpCommand from './commands/chat/HelpCommand.js';
import ReloadCommand from './commands/chat/ReloadCommand.js';
import Command from './commands/Command.js';
import CommandMetadata from './commands/CommandMetadata.js';
import ViewDateSent from './commands/message/ViewDateSent.js';
import ViewDateJoined from './commands/user/ViewDateJoined.js';
import ButtonHandler from './events/ButtonHandler.js';
import CommandHandler from './events/CommandHandler.js';
import GuildJoinHandler from './events/GuildJoinHandler.js';
import GuildLeaveHandler from './events/GuildLeaveHandler.js';
import MessageHandler from './events/MessageHandler.js';
import ReactionHandler from './events/ReactionHandler.js';
import TriggerHandler from './events/TriggerHandler.js';
import CustomClient from './extensions/CustomClient.js';
import Job from './jobs/Job.js';
import UpdateEventPlanningForum from './jobs/UpdateEventPlanningForum.js';
import Bot from './models/Bot.js';
import Reaction from './reactions/Reaction.js';
import CommandRegistrationService from './services/CommandRegistrationService.js';
import EventDataService from './services/EventDataService.js';
import JobService from './services/JobService.js';
import Logger from './services/Logger.js';
import Trigger from './triggers/Trigger.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    // Services
    let eventDataService = new EventDataService();

    // Client
    let client = new CustomClient({
        intents: Config.client.intents,
        partials: (Config.client.partials as string[]).map(
            partial => Partials[partial as keyof typeof Partials]
        ),
        makeCache: Options.cacheWithLimits({
            // Keep default caching behavior
            ...Options.DefaultMakeCacheSettings,
            // Override specific options from config
            ...Config.client.caches,
        }),
    });

    // Commands
    let commands: Command[] = [
        // Chat Commands
        new DevCommand(),
        new HelpCommand(),
        new ReloadCommand(),

        // Message context menu commands
        new ViewDateSent(),

        // User context menu commands
        new ViewDateJoined(),

        // TODO: Add new commands here
    ];

    // Buttons
    let buttons: Button[] = [
        // TODO: Add new buttons here
    ];

    // Reactions
    let reactions: Reaction[] = [
        // TODO: Add new reactions here
    ];

    // Triggers
    let triggers: Trigger[] = [
        // TODO: Add new triggers here
    ];

    // Event handlers
    let guildJoinHandler = new GuildJoinHandler(eventDataService);
    let guildLeaveHandler = new GuildLeaveHandler();
    let commandHandler = new CommandHandler(commands, eventDataService);
    let buttonHandler = new ButtonHandler(buttons, eventDataService);
    let triggerHandler = new TriggerHandler(triggers, eventDataService);
    let messageHandler = new MessageHandler(triggerHandler);
    let reactionHandler = new ReactionHandler(reactions, eventDataService);

    // Jobs
    let jobs: Job[] = [new UpdateEventPlanningForum(client)];

    // Bot
    let bot = new Bot(
        Config.client.token,
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        commandHandler,
        buttonHandler,
        reactionHandler,
        new JobService(jobs)
    );

    // Register
    if (process.argv[2] == 'commands') {
        try {
            let rest = new REST({ version: '10' }).setToken(Config.client.token);
            let commandRegistrationService = new CommandRegistrationService(rest);
            let localCmds = [
                ...Object.values(CommandMetadata.ChatCommands).sort((a, b) =>
                    a.name > b.name ? 1 : -1
                ),
                ...Object.values(CommandMetadata.MessageMenuCommands).sort((a, b) =>
                    a.name > b.name ? 1 : -1
                ),
                ...Object.values(CommandMetadata.UserMenuCommands).sort((a, b) =>
                    a.name > b.name ? 1 : -1
                ),
            ];
            await commandRegistrationService.process(localCmds, process.argv);
        } catch (error) {
            Logger.error(Logs.error.commandAction, error);
        }
        // Wait for any final logs to be written.
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit();
    }

    await bot.start();
}

process.on('unhandledRejection', (reason, _promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
