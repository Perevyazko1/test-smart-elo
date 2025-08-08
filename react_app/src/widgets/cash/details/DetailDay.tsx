import type {IEarning} from "@/entities/salary";
import {DetailRow} from "./DetailRow";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";


interface DetailDayProps {
    earnings: IEarning[];
    date: string;
    startBalance: number;
    endBalance: number;
}


export const DetailDay = (props: DetailDayProps) => {
    const {earnings: unsortedEarnings, date, startBalance, endBalance} = props;

    const earnings = [...unsortedEarnings].sort((a, b) =>
        new Date(a.cash_date).getTime() - new Date(b.cash_date).getTime()
    );

    const positiveSum = earnings.reduce((acc, curr) =>
        curr.amount > 0 ? acc + curr.amount : acc, 0
    );

    const negativeSum = earnings.reduce((acc, curr) =>
        curr.amount < 0 ? acc + Math.abs(curr.amount) : acc, 0
    );

    return (
        <>
            <tr className={'bg-yellow-100'}>
                <td className={"text-[2em]"} colSpan={4} rowSpan={2}>
                    {new Date(date).toLocaleDateString('ru-RU', {weekday: 'short'})}
                </td>

                <th>Н.БАЛАНС</th>
                <th>Приход</th>
                <th>Расход</th>
                <th colSpan={2}>К.БАЛАНС</th>
            </tr>
            <tr className={'bg-yellow-100'}>
                <th><NiceNum value={startBalance}/></th>
                <th><NiceNum value={positiveSum}/></th>
                <th><NiceNum value={negativeSum}/></th>
                <th colSpan={2}><NiceNum value={endBalance}/></th>
            </tr>

            {earnings.map((earning, index) => (
                <DetailRow
                    balance={startBalance + earnings.slice(0, index + 1).reduce((acc, curr) => acc + curr.amount, 0)}
                    key={earning.id}
                    earning={earning}
                />
            ))}
            <tr>
                <td>------</td>
            </tr>
        </>
    );
};