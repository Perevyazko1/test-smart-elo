import type {IEarning} from "@/entities/salary";
import {DetailRow} from "@/widgets/cash/details/DetailRow.tsx";
import {ReaderIcon} from "@radix-ui/react-icons";
import type {IWeek} from "@/shared/utils/date.ts";

interface DetailsTableProps {
    earnings: IEarning[];
    start_balance: number;
    week: IWeek;
}

export const DetailsTable = (props: DetailsTableProps) => {
    const {earnings, start_balance, week} = props;

    const positiveSum = earnings.reduce((acc, curr) =>
        curr.amount > 0 ? acc + curr.amount : acc, 0
    );

    const negativeSum = earnings.reduce((acc, curr) =>
        curr.amount < 0 ? acc + Math.abs(curr.amount) : acc, 0
    );

    return (
        <table className={'w-full text-sm'}>
            <thead className={'border-gray-400 border-1'}>
            <tr>
                <th rowSpan={2} colSpan={3}>Касса:</th>
                <th>Приход:</th>
                <th>Расход:</th>
                <th>НАЧ БАЛАНС:</th>
                <th className={'text-center'}>
                    <ReaderIcon/>
                </th>
            </tr>
            <tr>
                <th>{positiveSum.toLocaleString('ru-RU')}</th>
                <th>{negativeSum.toLocaleString('ru-RU')}</th>
                <th>{start_balance.toLocaleString('ru-RU')}</th>
            </tr>
            </thead>

            <tbody className={'text-center border-gray-400 border-1'}>
            {earnings.map((item, index) => (
                <DetailRow
                    earning={item}
                    balance={earnings.slice(0, index).reduce((acc, curr) => acc + curr.amount, 0) + start_balance}
                    key={item.id}
                    week={week}
                />
            ))}

            <tr className={'border-gray-400 border-1'}>
                <th colSpan={4}></th>
                <th>КОН БАЛАНС:</th>
                <th>
                    {(start_balance + positiveSum - negativeSum
                    ).toLocaleString('ru-RU')}
                </th>
            </tr>
            </tbody>
        </table>
    );
};