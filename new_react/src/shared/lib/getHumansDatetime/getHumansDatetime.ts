export const getHumansDatetime = (utc_datetime: string, variant: 'full' | 'short' = 'full') => {
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
