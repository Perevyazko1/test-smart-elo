import {TransferRow} from "@/pages/transfers/TransferRow.tsx";

interface Props {

}

export const TransferWidget = (props: Props) => {
    const {} = props;

    return (
        <table>
            <thead>
            <tr>
                <td>Откуда</td>
                <td>Через</td>
                <td>Куда</td>
            </tr>
            </thead>

            <tbody>
            <TransferRow/>

            </tbody>

        </table>
    );
};
