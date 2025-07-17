import {TD} from "@/shared/ui/table/TD.tsx";

interface SalaryDetailRowProps {
    name: string;
    sum: number;
    comment: string;
    date: string;
    earning_type: string;
}

export const SalaryDetailRow = (props: SalaryDetailRowProps) => {
    const {name, sum, date, comment, earning_type} = props;

    return (
        <tr>
            <TD>
                {date}
            </TD>
            <TD>
                {earning_type}
            </TD>
            <TD className={'text-[.8em]'}>
                {name}
            </TD>
            <TD>
                {sum.toLocaleString("ru-RU")}
            </TD>
            <TD>
                {comment}
            </TD>
        </tr>
    );
};