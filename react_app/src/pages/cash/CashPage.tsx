import {useEffect, useState} from "react";
import {generateWeeks, type IWeek} from "@/shared/utils/date.ts";
import {CashBody} from "@/pages/cash/ui/CashBody.tsx";


export const CashPage = () => {

    const [weeks, setWeeks] = useState<IWeek[]>([]);
    const [currentWeek, setCurrentWeek] = useState<IWeek | null>(null);

    useEffect(() => {
        const generatedWeeks = generateWeeks();
        setWeeks(generatedWeeks);

        if (generatedWeeks.length > 0) {
            setCurrentWeek(generatedWeeks[0]);
        }
    }, []);


    return (
        <div className={'flex flex-row bg-yellow-50 h-full p-2'}>
            {currentWeek && (
                <CashBody
                    weeks={weeks}
                    currentWeek={currentWeek}
                    setCurrentWeek={setCurrentWeek}
                />
            )}
        </div>
    );
};