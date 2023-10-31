import { ChannelType } from 'discord.js';
import { decode } from 'html-entities';
import { login } from 'mahi-tahi-api';
import { createRequire } from 'node:module';

import Job from './Job.js';
import CustomClient from '../extensions/CustomClient.js';
import Language from '../models/enumHelpers/Language.js';
import Lang from '../services/Lang.js';
import DateUtils from '../utils/DateUtils.js';
import MahiTahiUtils from '../utils/MahiTahiUtils.js';
import MessageUtils from '../utils/MessageUtils.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Data = require('../../config/data.json');

export default class UpdateEventPlanningForum extends Job {
    public name = 'Update Event Planning Forum';
    public schedule: string = Config.jobs.UpdateEventPlanningForum.schedule;
    public log: boolean = Config.jobs.UpdateEventPlanningForum.log;
    public runOnce: boolean = Config.jobs.UpdateEventPlanningForum.runOnce;
    public initialDelaySecs: number = Config.jobs.UpdateEventPlanningForum.initialDelaySecs;
    public postDaysBeforeEvent: number = Config.jobs.UpdateEventPlanningForum.postDaysBeforeEvent;

    constructor(private client: CustomClient) {
        super();
    }

    public async run(): Promise<void> {
        const currentYear = new Date().getFullYear();
        const yearInXDays = new Date(
            Date.now() + (this.postDaysBeforeEvent + 1) + DateUtils.DAY_MS
        ).getFullYear();

        // Request year events from Mahi Tahi
        const credentials = await login(
            Data.mahiTahiCredentials.username,
            Data.mahiTahiCredentials.password
        );
        const eventsInYear = await MahiTahiUtils.getEventsInYear(
            credentials,
            currentYear === yearInXDays // If the next year is in x days, request both years
                ? currentYear
                : [currentYear, yearInXDays],
            Data.mahiTahiGroup
        );

        // Get events three days from now
        const eventsInXDays = MahiTahiUtils.filterEventsByDay(
            eventsInYear,
            this.postDaysBeforeEvent
        );

        // Post events in this week channel
        const thisWeekChannel = await this.client.channels.fetch(
            Data.serverChannels.thisWeekChannel
        );
        if (thisWeekChannel.type === ChannelType.GuildText) {
            eventsInXDays.forEach(event => {
                MessageUtils.send(
                    thisWeekChannel,
                    Lang.getEmbed('displayEmbeds.nextWeek', Language.Default, {
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
                    })
                );
            });
        }

        console.log(JSON.stringify(eventsInXDays));
    }
}
