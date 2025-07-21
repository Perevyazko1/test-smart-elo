import type {IEarning} from "@/entities/salary";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";

import {SalaryDetailRow} from "./SalaryDetailRow";

interface DetailTableProps {
    earnings: IEarning[] | null;
    weekNumber: number;
    selectedUserId: number;
}

export const DetailTable = (props: DetailTableProps) => {
    const {earnings, weekNumber, selectedUserId} = props;

    const detailTotalSum = earnings?.reduce(
        (acc, item) => acc + item.amount, 0
    ) || 0;

    return (
        <Table>
            <THead>
                <tr>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Дата
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Тип начисления
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Изделие / Описание
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Сумма
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Примечание
                    </th>
                </tr>
            </THead>


            <tbody>
            {earnings?.map((row) => (
                <SalaryDetailRow
                    earning={row}
                    selectedUserId={selectedUserId}
                    weekNumber={weekNumber}
                    key={row.id}
                />
            ))}

            <tr className={'bg-gray-200 text-nowrap'}>
                <th
                    colSpan={3}
                    className="py-2 px-4 border border-gray-300 text-right"
                >
                    <b>Итого:</b>
                </th>
                <th
                    colSpan={2}
                    className="py-2 px-4 border border-gray-300 text-left"
                >
                    <b>{detailTotalSum.toLocaleString("ru-RU")} Р.</b>
                </th>
            </tr>
            </tbody>
        </Table>
    );
};