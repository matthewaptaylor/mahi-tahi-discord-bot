import { REST } from '@discordjs/rest';
import { Options, Partials } from 'discord.js';
import { createRequire } from 'node:module';

import { Button } from './buttons/index.js';
import { DevCommand } from './commands/chat/dev-command.js';
import { HelpCommand } from './commands/chat/help-command.js';
import { Command } from './commands/command.js';
import { ViewDateSent } from './commands/message/view-date-sent.js';
import {
    ChatCommandMetadata,
    MessageCommandMetadata,
    UserCommandMetadata,
} from './commands/metadata.js';
import { ViewDateJoined } from './commands/user/view-date-joined.js';
import { ButtonHandler } from './events/button-handler.js';
import { CommandHandler } from './events/command-handler.js';
import { GuildJoinHandler } from './events/guild-join-handler.js';
import { GuildLeaveHandler } from './events/guild-leave-handler.js';
import { MessageHandler } from './events/message-handler.js';
import { ReactionHandler } from './events/reaction-handler.js';
import { TriggerHandler } from './events/trigger-handler.js';
import { CustomClient } from './extensions/custom-client.js';
import { Job } from './jobs/job.js';
import { Bot } from './models/bot.js';
import { Reaction } from './reactions/index.js';
import { CommandRegistrationService } from './services/command-registration-service.js';
import { EventDataService } from './services/event-data-service.js';
import { JobService } from './services/job-service.js';
import { Logger } from './services/logger.js';
import { Trigger } from './triggers/index.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    // Services
    let eventDataService = new EventDataService();

    // Client
    let client = new CustomClient({
        intents: Config.client.intents,
        partials: (Config.client.partials as string[]).map(partial => Partials[partial]),
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
    let jobs: Job[] = [
        // TODO: Add new jobs here
    ];

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
                ...Object.values(ChatCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
                ...Object.values(MessageCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
                ...Object.values(UserCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
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