import {useEffect, useState} from "react";

import {SalaryPayrollWidget} from "@/widgets/payroll/SalaryPayrollWidget.tsx";
import {SalaryDetailWidget} from "@/widgets/salary/detail/SalaryDetailWidget.tsx";

import {SalaryPanel} from "./panel/SalaryPanel.tsx";
import {generateWeeks, type IWeek} from "@/shared/utils/date.ts";

interface SalaryPageProps {

}

export const SalaryPage = (props: SalaryPageProps) => {
    const {} = props;

    const [weeks, setWeeks] = useState<IWeek[]>([]);
    const [currentWeek, setCurrentWeek] = useState<IWeek | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


    useEffect(() => {
        const generatedWeeks = generateWeeks();
        setWeeks(generatedWeeks);

        if (generatedWeeks.length > 0) {
            setCurrentWeek(generatedWeeks[0]);
        }
    }, [])

    return (
        <div className={'max-w-dvw'}>
            <SalaryPanel
                weeks={weeks}
                setCurrentWeek={setCurrentWeek}
                currentWeek={currentWeek}
                setSelectedUserId={setSelectedUserId}
                selectedUserId={selectedUserId}
            />
            {currentWeek && (
                <>
                    {
                        selectedUserId ? (
                            <SalaryDetailWidget
                                selectedUserId={selectedUserId}
                                currentWeek={currentWeek}
                            />
                        ) : (
                            <SalaryPayrollWidget
                                currentWeek={currentWeek}
                                setSelectedUserId={setSelectedUserId}
                            />
                        )
                    }
                </>
            )}
        </div>
    );
};