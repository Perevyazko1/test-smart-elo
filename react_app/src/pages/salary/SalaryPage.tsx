import {SalaryPanel} from "./panel/SalaryPanel.tsx";
import {SalaryPayrollWidget} from "@/widgets/salary/payroll/SalaryPayrollWidget.tsx";
import {SalaryDetailWidget} from "@/widgets/salary/detail/SalaryDetailWidget.tsx";
import {useState} from "react";

interface SalaryPageProps {

}

export const SalaryPage = (props: SalaryPageProps) => {
    const {} = props;

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    return (
        <div className={'max-w-dvw'}>
            <SalaryPanel
                setSelectedUserId={setSelectedUserId}
                selectedUserId={selectedUserId}
            />
            {selectedUserId ? (
                <SalaryDetailWidget
                    selectedUserId={selectedUserId}
                />
            ) : (
                <SalaryPayrollWidget
                    setSelectedUserId={setSelectedUserId}
                />
            )}
        </div>
    );
};