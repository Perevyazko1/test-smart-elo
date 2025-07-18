import {TD} from "@/shared/ui/table/TD.tsx";
import {twMerge} from "tailwind-merge";

interface SalaryWeekInfoRowProps {
    date: string;
    sum: number;
    name: string;
}

export const SalaryWeekInfoRow = (props: SalaryWeekInfoRowProps) => {
    const {date, sum, name} = props;

    return (
        <tr>
            <TD>
                {new Date(date).toLocaleString("ru", {day: 'numeric', month: 'long'})}
            </TD>
            <TD>
                {name}
            </TD>
            <TD className={twMerge([
                'text-nowrap',
                sum > 0 ? 'bg-green-100' : 'bg-red-100'
            ])}>
                {sum.toLocaleString('ru-RU')}
            </TD>
        </tr>
    );
};