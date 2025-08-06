import {SalaryPayrollWidget} from "@/widgets/payroll/SalaryPayrollWidget.tsx";

import {SalaryPanel} from "./panel/SalaryPanel.tsx";
import {useWeeks} from "@/shared/utils/date.ts";
import {useParams} from "react-router-dom";

interface SalaryPageProps {

}

export const SalaryPage = (props: SalaryPageProps) => {
    const {} = props;
    const {date_from} = useParams();

    const {weeks, currentWeek} = useWeeks({initialDateFrom: date_from});

    return (
        <div className={'max-w-dvw'}>
            <SalaryPanel
                weeks={weeks}
                url={'/salary'}
                currentWeek={currentWeek}
            />
            {currentWeek && (
                <SalaryPayrollWidget
                    currentWeek={currentWeek}
                />
            )}
        </div>
    );
};