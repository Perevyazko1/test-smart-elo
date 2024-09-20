import {DayDetail} from "@pages/WagesPage/ui/WagesWeek/DayDetail";
import {Transaction} from "@entities/Transaction";
import {Table} from "react-bootstrap";
import {useEmployeeName} from "@shared/hooks";

interface WagesInfoProps {
    startDate: string;
    endDate: string;
    employeeId: number;
    onClick: (transaction: Transaction) => void;
}

export const WagesInfo = (props: WagesInfoProps) => {
    const {startDate, employeeId, endDate, onClick} = props;

    const {getNameById} = useEmployeeName();

    return (
        <Table>
            <thead>
            <tr>
                <th>
                    Детализация по заработной плате {getNameById(employeeId, 'listNameInitials')}
                </th>
            </tr>
            </thead>

            <tbody>
            <DayDetail
                startDate={startDate}
                employeeId={employeeId}
                endDate={endDate}
                onClick={onClick}
            />
            </tbody>
        </Table>
    );
};
