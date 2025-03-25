export const appDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
export const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export interface DayInfo {
    day: string;
    dtDay: string | null;
}


export const getNextDays = (count: number): DayInfo[] => {
    const result = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        const dayName = appDays[currentDate.getDay()];
        const date = currentDate.getDate();
        const month = months[currentDate.getMonth()];

        // Приводим дату к формату "YYYY-MM-DD HH:MM:SS"
        const isoString = currentDate.toISOString();
        const dtDay = isoString.replace('T', ' ').substring(0, 10);

        result.push({
            day: `${dayName} ${date} ${month}`,
            dtDay,
        });
    }

    return result;
}

