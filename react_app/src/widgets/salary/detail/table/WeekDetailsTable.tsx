import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import type {IEarning} from "@/entities/salary";

import {SalaryWeekInfoRow} from "./SalaryWeekInfoRow.tsx";
import {groupEarningsByDateType} from "@/shared/utils/groupEarning.ts";


interface WeekDetailsTableProps {
    earnings: IEarning[] | null;
}


export const WeekDetailsTable = (props: WeekDetailsTableProps) => {
    const {earnings} = props;

    const groupedData = earnings ? groupEarningsByDateType(earnings) : [];

    return (
        <Table>
            <THead>
                <tr>
                    <th
                        colSpan={3}
                        className={'py-1 px-2 border-b border-gray-300 text-left'}
                    >
                        Сводное инфо по неделям
                    </th>
                </tr>
            </THead>

            <tbody>
            {groupedData?.map((item, index) => (
                <SalaryWeekInfoRow
                    key={index}
                    name={item.earning_type}
                    sum={item.sum}
                    date={item.date}
                />
            ))}
            </tbody>
        </Table>
    );
};