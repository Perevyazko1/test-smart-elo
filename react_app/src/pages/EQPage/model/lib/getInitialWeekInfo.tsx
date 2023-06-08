import {EQ_WEEK_YEAR_INFO} from "shared/const/localstorage";

export const getInitialWeekInfo = (): { week: number | undefined, year: number | undefined } => {
    const localeData = localStorage.getItem(EQ_WEEK_YEAR_INFO);
    let week = undefined;
    let year = undefined;
    if (localeData) {
        const date = Number(JSON.parse(localeData).date);

        if (formatDate(date) === formatDate(Date.now())) {
            week = Number(JSON.parse(localeData).week);
            year = Number(JSON.parse(localeData).year);
        } else {
            localStorage.removeItem(EQ_WEEK_YEAR_INFO);
        }
    }

    return {
        week: week,
        year: year,
    }
}

function formatDate(date: number) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('');
}