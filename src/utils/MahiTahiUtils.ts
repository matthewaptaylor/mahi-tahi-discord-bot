import {
    AuraActionBuilder,
    AuraActionClassname,
    AuraActionsResponseAction,
    Credentials,
    EventsControllerMethod,
    GetMyProgrammeReturnValue,
} from 'mahi-tahi-api';

import DateUtils from './DateUtils.js';

export default class MahiTahiUtils {
    public static readonly TERMS = [1, 2, 3, 4];

    /**
     * Returns all events in the given year.
     * @param credentials
     * @param years
     * @param groupId The ID of the group to filter by.
     * @returns All events in the given year.
     */
    public static async getEventsInYear(
        credentials: Credentials,
        years: number | number[],
        groupId?: string
    ): Promise<GetMyProgrammeReturnValue['returnValue']> {
        // Request term events from Mahi Tahi
        const builder = new AuraActionBuilder();

        years = Array.isArray(years) ? years : [years];
        const termReqs: Promise<AuraActionsResponseAction<GetMyProgrammeReturnValue>>[] = [];
        years.forEach(year =>
            [1, 2, 3, 4].forEach(term =>
                termReqs.push(
                    builder.addAction(
                        `${term}${year};a`,
                        AuraActionClassname.EventsController,
                        EventsControllerMethod.getMyProgramme,
                        {
                            termFilter: MahiTahiUtils.createTermString(term, year),
                            contact: '',
                            reload: 0,
                            navreload: 0,
                            groupFilter: groupId ?? '',
                        }
                    )
                )
            )
        );
        builder.post(credentials.sid, credentials.auraToken);

        // Extract events from response
        const eventsInYear: GetMyProgrammeReturnValue['returnValue'] = [];
        (await Promise.all(termReqs)).forEach(term => {
            term.returnValue.returnValue.forEach(event => eventsInYear.push(event));
        });

        return eventsInYear;
    }

    /**
     * Filters the given events by the given day.
     * @param events Events to filter.
     * @param daysFromNow The number of days from now to filter by.
     * @returns Events that start on the given day.
     */
    public static filterEventsByDay(
        events: GetMyProgrammeReturnValue['returnValue'],
        daysFromNow: number
    ): GetMyProgrammeReturnValue['returnValue'] {
        const now = new Date().getTime();
        const dayStart = DateUtils.getBeginningOfDay(
            new Date(now + daysFromNow * DateUtils.DAY_MS)
        );
        const dayEnd = DateUtils.getBeginningOfDay(
            new Date(now + (daysFromNow + 1) * DateUtils.DAY_MS)
        );

        // Add event to upcomingEvents if it starts in three days
        const foundEvents: GetMyProgrammeReturnValue['returnValue'] = [];
        events.forEach(event => {
            if (
                dayStart <= new Date(event.Event__r.Start_Date__c) &&
                new Date(event.Event__r.Start_Date__c) < dayEnd
            )
                foundEvents.push(event);
        });

        return foundEvents;
    }

    public static filterEventsByRange(
        events: GetMyProgrammeReturnValue['returnValue'],
        from: Date | undefined,
        to: Date | undefined
    ): GetMyProgrammeReturnValue['returnValue'] {
        const foundEvents: GetMyProgrammeReturnValue['returnValue'] = [];
        events.forEach(event => {
            if (
                (!from || new Date(event.Event__r.Start_Date__c) >= from) &&
                (!to || new Date(event.Event__r.Start_Date__c) <= to)
            )
                foundEvents.push(event);
        });

        return foundEvents;
    }

    public static createTermString(term: number, year: number): `Term ${number} ${number}` {
        return `Term ${term} ${year}`;
    }
}
