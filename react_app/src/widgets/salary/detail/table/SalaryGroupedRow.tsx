import {TD} from "@/shared/ui/table/TD.tsx";
import {NiceNum} from "@/shared/ui/text/NiceNum.tsx";

interface SalaryGroupedRowProps {
    date: string;
    name: string;
    quantity: number;
    amount: number;
    total: number;
}

export const SalaryGroupedRow = (props: SalaryGroupedRowProps) => {
    const {name, total, date, amount, quantity} = props;

    return (
        <tr>
            <TD className={'text-nowrap'}>
                {new Date(date).toLocaleString("ru", {day: 'numeric', month: 'long'})}
            </TD>
            <TD>
                {name}
            </TD>
            <TD className={'text-end'}>
                <NiceNum value={amount}/>
            </TD>
            <TD className={'font-mono'}>
                {quantity}
            </TD>
            <TD className={'text-end'}>
                <NiceNum value={total}/>
            </TD>
        </tr>
    );
};