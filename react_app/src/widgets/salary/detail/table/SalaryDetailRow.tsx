import {TD} from "@/shared/ui/table/TD.tsx";

interface SalaryDetailRowProps {

}

export const SalaryDetailRow = (props: SalaryDetailRowProps) => {
    const {} = props;

    return (
        <tr>
            <TD>
                Евродиван Монреаль 1.9
            </TD>
            <TD>
                2100
            </TD>
            <TD>
                3
            </TD>
            <TD>
                6300
            </TD>
            <TD>
                Помогал
            </TD>
        </tr>
    );
};