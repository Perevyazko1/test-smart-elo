import dayjs from "dayjs";
import relativeDate from "dayjs/plugin/relativeTime";


dayjs.extend(relativeDate);


export const transformDate = (date: string): string => {
    return dayjs(date).fromNow();
}