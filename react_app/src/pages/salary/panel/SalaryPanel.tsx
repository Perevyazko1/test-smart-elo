import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import type {IWeek} from "@/shared/utils/date.ts";
import {Link} from "react-router-dom";

interface SalaryPanelProps {
    weeks: IWeek[];
    currentWeek: IWeek | null;
    url: string;
}

export const SalaryPanel = (props: SalaryPanelProps) => {
    const {weeks, currentWeek, url} = props;

    return (
        <div className={twMerge([
            'fixed top-10 z-11',
            'flex items-center gap-2 p-1 px-2 bg-blue-100 min-w-[calc(100vw-21px)] noPrint',
            'border border-gray-400 text-nowrap'
        ])}>
            <div className={'flex items-center gap-2 min-w-0'}>
                <div className={'hidden md:block'}>
                    Недели:
                </div>
                <div className={twMerge([
                    'flex text-sm',
                    'overflow-x-auto'
                ])}>
                    {weeks.map((week) => (
                        <Link
                            key={week.weekNumber}
                            to={`${url}/${week.date_from}/${week.date_to}/`}
                        >
                            <Btn
                                className={
                                    twMerge([
                                        'text-sm text-black py-0 px-2 border border-gray-400',
                                        currentWeek?.weekNumber === week.weekNumber ? 'bg-yellow-200' : 'bg-blue-200'
                                    ])}
                            >
                                Неделя {week.weekNumber}
                                <br/>
                                {week.dateRangeStr}
                            </Btn>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};