import { AnyThreadChannel, ChannelType, Client, EmbedBuilder, FetchedThreads } from 'discord.js';
import { decode } from 'html-entities';
import { GetMyProgrammeReturnValue } from 'mahi-tahi-api';
import { createRequire } from 'node:module';

import DateUtils from './DateUtils.js';
import MahiTahiUtils from './MahiTahiUtils.js';
import Language from '../models/enumHelpers/Language.js';
import Lang from '../services/Lang.js';

const require = createRequire(import.meta.url);
let Data = require('../../config/data.json');

export default class EventManagementUtils {
    /**
     * Creates an embed for an event.
     * @param event Event to create embed from.
     * @returns Embed for event.
     */
    public static createEventEmbed(
        event: GetMyProgrammeReturnValue['returnValue'][0]
    ): EmbedBuilder {
        return Lang.getEmbed('displayEmbeds.nextWeek', Language.Default, {
            NAME: event.Event_Name__c,
            URL: `https://mahitahi.scouts.nz/s/event/${event.Event__c}`,
            DESCRIPTION: decode(event.Event__r.Rich_Description__c),
            ICON: event.Event__r.Event_Icon__c,
            LOCATION:
                event.Event__r.Venue_Display_Text__c ??
                event.Event__r.None_Standard_Venue__c ??
                'TBC',
            START: DateUtils.format(event.Event__r.Start_Date__c),
            END: DateUtils.format(event.Event__r.End_Date__c),
        });
    }

    /**
     * Creates forum threads for upcoming events that don't have one.
     * @param client Discord client.
     * @param events Events to create channels from.
     */
    public static async createEventPlanningThreads(
        client: Client,
        events: GetMyProgrammeReturnValue['returnValue']
    ): Promise<void> {
        // Get upcoming events
        const upcomingEvents = MahiTahiUtils.filterEventsByRange(
            events,
            DateUtils.getBeginningOfDay(new Date()),
            undefined
        );

        // Create forum threads for upcoming events that don't have one
        const planningChannel = await client.channels.fetch(Data.serverChannels.eventPlanningForum);
        if (planningChannel.type === ChannelType.GuildForum) {
            const activeThreads = await planningChannel.threads.fetchActive();
            let archivedThreads: FetchedThreads;

            upcomingEvents.forEach(async event => {
                // Find event's thread
                let thread = activeThreads.threads.find(thread =>
                    thread.name.endsWith(`(${event.Event__c})`)
                );

                if (thread === undefined) {
                    // Search in archived threads
                    if (archivedThreads === undefined)
                        // Fetch archived threads if not already fetched
                        archivedThreads = await planningChannel.threads.fetchArchived();

                    thread = archivedThreads.threads.find(thread =>
                        thread.name.endsWith(`(${event.Event__c})`)
                    );

                    if (thread === undefined) {
                        // Create new thread
                        thread = (await planningChannel.threads.create({
                            name: `${event.Event_Name__c} (${event.Event__c})`,
                            message: {
                                content: Lang.getRef(
                                    'displayMessages.eventPlanningForum',
                                    Language.Default,
                                    {
                                        NAME: event.Event_Name__c,
                                    }
                                ),
                                embeds: [this.createEventEmbed(event)],
                            },
                        })) as AnyThreadChannel;
                    }
                }
            });
        }
    }
}
