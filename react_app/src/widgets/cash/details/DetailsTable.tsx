import type {IEarning} from "@/entities/salary";
import {ReaderIcon} from "@radix-ui/react-icons";
import type {IWeek} from "@/shared/utils/date.ts";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";
import {DetailDay} from "@/widgets/cash/details/DetailDay.tsx";

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

    const groupedEarnings = earnings.reduce((groups, item) => {
        const date = item.cash_date.split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
        return groups;
    }, {} as Record<string, IEarning[]>);

    // Sort dates from oldest to newest
    const sortedDates = Object.keys(groupedEarnings).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });

    let runningBalance = start_balance;
    const sortedGroupedEarnings = sortedDates.reduce((sorted, date) => {
        const dayEarnings = groupedEarnings[date];
        const startBalance = runningBalance;

        // Update running balance with this day's transactions
        runningBalance += dayEarnings.reduce((sum, earning) => sum + earning.amount, 0);

        sorted[date] = {
            earnings: dayEarnings,
            startBalance,
            endBalance: runningBalance
        };
        return sorted;
    }, {} as Record<string, {
        earnings: IEarning[],
        startBalance: number,
        endBalance: number
    }>);


    return (
        <table className={'w-full text-sm'}>
            <thead className={'border-gray-400'}>
            <tr>
            <th rowSpan={2}>НЕД {week.weekNumber}</th>
                <th rowSpan={2}>Счет</th>
                <th rowSpan={2}>Получатель</th>
                <th rowSpan={2}>Комментарий</th>
                <th>Н.БАЛАНС</th>
                <th>Приход</th>
                <th>Расход</th>
                <th>К.БАЛАНС</th>
                <th rowSpan={2} className={'text-center ps-4'}>
                    <ReaderIcon/>
                </th>
            </tr>
            <tr>
                <th><NiceNum value={start_balance}/></th>
                <th><NiceNum value={positiveSum}/></th>
                <th><NiceNum value={negativeSum}/></th>
                <th><NiceNum value={start_balance + positiveSum - negativeSum}/></th>
            </tr>
            </thead>

            <tbody className={'text-start'}>
            <tr><td>----</td></tr>

            {Object.entries(sortedGroupedEarnings).map(([date, item]) => (
                <DetailDay
                    key={date}
                    date={date}
                    earnings={item.earnings}
                    startBalance={item.startBalance}
                    endBalance={item.endBalance}
                />
            ))}

            <tr className={'bg-green-50'}><td colSpan={9}>-</td></tr>
            </tbody>
        </table>
    );
};