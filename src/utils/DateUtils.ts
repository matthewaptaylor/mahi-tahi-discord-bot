import Language from '../models/enumHelpers/Language.js';

export default class DateUtils {
    public static readonly DAY_MS = 24 * 60 * 60 * 1000;

    public static getNextMonday(date: Date): Date {
        const dayOfWeek = date.getDay();
        const daysUntilMonday = 8 - dayOfWeek;
        const nextMonday = new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
        return nextMonday;
    }

    public static getBeginningOfDay(date: Date): Date {
        const beginningOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return beginningOfDay;
    }

    public static format(date: Date | string): string {
        if (typeof date === 'string') date = new Date(date);

        return `${date.toLocaleTimeString(Language.Default, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })}, ${date
            .toLocaleDateString(Language.Default, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            })
            .replace(',', '')}`;
    }
}
