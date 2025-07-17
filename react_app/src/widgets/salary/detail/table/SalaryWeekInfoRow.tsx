import {TD} from "@/shared/ui/table/TD.tsx";
import type {IEarning} from "@/entities/salary";
import {twMerge} from "tailwind-merge";

interface SalaryWeekInfoRowProps {
    earning: IEarning;
}

export const SalaryWeekInfoRow = (props: SalaryWeekInfoRowProps) => {
    const {earning} = props;

    return (
        <tr>
            <TD>
                {earning.target_date}
            </TD>
            <TD>
                {earning.earning_type}
            </TD>
            <TD className={twMerge([
                'text-nowrap',
                earning.amount > 0 ? 'bg-green-100' : 'bg-red-100'
            ])}>
                {earning.amount.toLocaleString('ru-RU')}
            </TD>
        </tr>
    );
};