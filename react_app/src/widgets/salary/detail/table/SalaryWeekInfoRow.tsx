import {TD} from "@/shared/ui/table/TD.tsx";

interface SalaryWeekInfoRowProps {

}

export const SalaryWeekInfoRow = (props: SalaryWeekInfoRowProps) => {
    const {} = props;

    return (
        <tr>
            <TD>
                07 июля
            </TD>
            <TD>
                Выплатили на карту
            </TD>
            <TD className={'text-nowrap bg-red-100'}>
                - 8 350
            </TD>
        </tr>
    );
};