import type {IEarning} from "@/entities/salary";
import {Table} from "@/shared/ui/table/Table.tsx";
import {THead} from "@/shared/ui/table/THead.tsx";
import {SalaryGroupedRow} from "@/widgets/salary/detail/table/SalaryGroupedRow.tsx";
import {groupEarnings} from "@/shared/utils/groupEarning.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";

interface DetailGroupedTableProps {
    earnings?: IEarning[] | null;
}

export const DetailGroupedTable = (props: DetailGroupedTableProps) => {
    const {earnings} = props;

    const detailTotalSum = earnings?.reduce(
        (acc, item) => acc + item.amount, 0
    ) || 0;

    const grouped = earnings ? groupEarnings(earnings) : [];

    return (
        <Table>
            <THead>
                <tr>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Дата
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Изделие / Описание
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Цена
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Количество
                    </th>
                    <th className={'py-1 px-2 border-b border-gray-300 text-left'}>
                        Итого
                    </th>
                </tr>
            </THead>


            <tbody>
            {grouped?.map((row, index) => (
                <SalaryGroupedRow
                    key={index}
                    date={row.date}
                    name={row.name}
                    quantity={row.quantity}
                    amount={row.amount}
                    total={row.total}
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
                    colSpan={2}
                    className="py-2 px-1 border font-bold border-gray-300 text-end"
                >
                    <NiceNum value={detailTotalSum}/>
                </th>
            </tr>
            </tbody>
        </Table>
    );
};