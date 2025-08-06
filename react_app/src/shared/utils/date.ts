import {getISOWeek, startOfISOWeek, endOfISOWeek, format, subWeeks, addWeeks} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useCallback, useEffect, useState} from 'react';

export interface IWeek {
    weekNumber: number;
    dateRangeStr: string;
    date_from: string;
    date_to: string;
}

export const toRuDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, 'd MMM yy', {locale: ru});
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

export const getToday = () => format(new Date(), 'yyyy-MM-dd');

export interface UseWeeksReturn {
    weeks: IWeek[];
    currentWeek: IWeek | null;
    setCurrentWeek: (week: IWeek) => void;
    nextWeek: () => void;
    previousWeek: () => void;
}

export const useWeeks = (props: {count?: number, initialDateFrom?: string}): UseWeeksReturn => {
    const {count = 7, initialDateFrom} = props;

    const [weeks, setWeeks] = useState<IWeek[]>([]);
    const [currentWeek, setCurrentWeek] = useState<IWeek | null>(null);

    useEffect(() => {
        const generatedWeeks = generateWeeks(count);
        setWeeks(generatedWeeks);

        if (generatedWeeks.length > 0) {
            if (initialDateFrom) {
                const initialWeek = generatedWeeks.find(week =>
                    week.date_from === initialDateFrom
                );
                if (initialWeek) {
                    setCurrentWeek(initialWeek);
                } else {
                    setCurrentWeek(generatedWeeks[0]);
                }
            } else {
                setCurrentWeek(generatedWeeks[0]);
            }
        }
    }, [count, initialDateFrom]);

    const nextWeek = useCallback(() => {
        if (!currentWeek) return;
        const currentIndex = weeks.findIndex(week => week.weekNumber === currentWeek.weekNumber);
        if (currentIndex > 0) {
            setCurrentWeek(weeks[currentIndex - 1]);
        }
    }, [currentWeek, weeks]);

    const previousWeek = useCallback(() => {
        if (!currentWeek) return;
        const currentIndex = weeks.findIndex(week => week.weekNumber === currentWeek.weekNumber);
        if (currentIndex < weeks.length - 1) {
            setCurrentWeek(weeks[currentIndex + 1]);
        }
    }, [currentWeek, weeks]);

    return {
        weeks,
        currentWeek,
        setCurrentWeek,
        nextWeek,
        previousWeek
    };
};

