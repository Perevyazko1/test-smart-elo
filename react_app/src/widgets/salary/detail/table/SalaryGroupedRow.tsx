import {TD} from "@/shared/ui/table/TD.tsx";

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
            <TD className={'text-[.8em]'}>
                {amount.toLocaleString("ru-RU")}
            </TD>
            <TD>
                {quantity}
            </TD>
            <TD>
                {total.toLocaleString("ru-RU")}
            </TD>
        </tr>
    );
};