import {getISOWeek, startOfISOWeek, endOfISOWeek, format, subWeeks} from 'date-fns';
import {ru} from 'date-fns/locale';

export interface IWeek {
    weekNumber: number;
    dateRangeStr: string;
    date_from: string;
    date_to: string;
}

export const toRuDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, 'd MMM yyyy', {locale: ru});
};

export const generateWeeks = (count: number = 7): IWeek[] => {
    const weeks: IWeek[] = [];
    let currentDate = new Date();

    for (let i = 0; i < count; i++) {
        const start = startOfISOWeek(currentDate);
        const end = endOfISOWeek(currentDate);

        const weekData: IWeek = {
            weekNumber: getISOWeek(currentDate),
            dateRangeStr: `${format(start, 'dd.MM')}-${format(end, 'dd.MM')}`,
            date_from: format(start, 'yyyy-MM-dd'),
            date_to: format(end, 'yyyy-MM-dd')
        };

        weeks.push(weekData);

        currentDate = subWeeks(currentDate, 1);
    }

    return weeks;
};


