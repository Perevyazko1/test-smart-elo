import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {twMerge} from "tailwind-merge";
import type {IWeek} from "@/shared/utils/date.ts";

interface SalaryPanelProps {
    setSelectedUserId: (arg: null) => void;
    selectedUserId: number | null;
    weeks: IWeek[];
    currentWeek: IWeek | null;
    setCurrentWeek: (arg: IWeek) => void;
}

export const SalaryPanel = (props: SalaryPanelProps) => {
    const {setSelectedUserId, selectedUserId, weeks, currentWeek, setCurrentWeek} = props;

    return (
        <div className={twMerge([
            'flex items-center gap-2 p-1 px-2 bg-blue-100 min-w-full',
            'border border-gray-400 text-nowrap'
        ])}>
            <div>
                <Btn
                    className={'h-full'}
                    disabled={!selectedUserId}
                    onClick={() => setSelectedUserId(null)}
                >
                    В ведомость
                </Btn>
            </div>
            <div className={'flex items-center gap-2 min-w-0'}>
                <div className={'hidden md:block'}>
                    Недели:
                </div>
                <div className={twMerge([
                    'flex text-sm',
                    'overflow-x-auto'
                ])}>
                    {weeks.map((week) => (
                        <Btn
                            key={week.weekNumber}
                            onClick={() => setCurrentWeek(week)}
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
                    ))}

                    {/*<div className={'flex flex-col items-center bg-blue-200 px-2'}>*/}
                    {/*    <span>Далее</span>*/}
                    {/*    <span>{"=>"}</span>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};