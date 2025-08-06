import type {IEarning} from "@/entities/salary";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";

import {SalaryDetailRow} from "./SalaryDetailRow";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";

interface DetailTableProps {
    earnings: IEarning[] | null;
    selectedUserId: number;
}

export const DetailTable = (props: DetailTableProps) => {
    const {earnings, selectedUserId} = props;

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
                        Примечание
                    </th>

                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Сумма
                    </th>
                </tr>
            </THead>


            <tbody>
            {earnings?.map((row) => (
                <SalaryDetailRow
                    earning={row}
                    selectedUserId={selectedUserId}
                    key={row.id}
                />
            ))}

            <tr className={'bg-gray-200 text-nowrap'}>
                <th
                    colSpan={4}
                    className="py-2 px-4 border border-gray-300 text-right"
                >
                    <b>Итого:</b>
                </th>
                <th
                    className="py-2 px-1 border border-gray-300 text-end"
                >
                    <NiceNum value={detailTotalSum}/>
                </th>
            </tr>
            </tbody>
        </Table>
    );
};