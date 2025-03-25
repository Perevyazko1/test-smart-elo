import {appDays} from "@pages/EqPage/model/lib/getNextDays";

export const getHumansDatetime = (
    utc_datetime: string,
    variant: 'full' | 'short' | 'DD-MM' | 'DAY' | 'YYYY-MM-DD' = 'full'
) => {
    if (utc_datetime === '') {
        return "";
    }

    if (variant === 'full') {
        const dateTime = new Date(utc_datetime);
        const date = dateTime.toLocaleDateString(
            'ru-RU',
            {day: '2-digit', month: '2-digit', year: 'numeric'}
        );
        const time = dateTime.toLocaleTimeString(
            'ru-RU',
            {hour: '2-digit', minute: '2-digit'}
        );

        return `${date} - ${time}`
    } else if (variant === 'DD-MM') {
        const dateTime = new Date(utc_datetime);

       const date = dateTime.toLocaleDateString(
            'ru-RU',
            {day: '2-digit', month: 'short'}
        );

       return `${date}`;

    } else if (variant === 'YYYY-MM-DD') {
        return `${utc_datetime.slice(0, 10)}`;
    } else if (variant === 'DAY') {
        const dateTime = new Date(utc_datetime);
        return appDays[dateTime.getDay()];
    } else {
        const dateTime = new Date(utc_datetime);
        const date = dateTime.toLocaleDateString(
            'ru-RU',
            {day: '2-digit', month: 'short'}
        );
        const time = dateTime.toLocaleTimeString(
            'ru-RU',
            {hour: '2-digit', minute: '2-digit'}
        );

        return `${date}${time}`
    }

}
