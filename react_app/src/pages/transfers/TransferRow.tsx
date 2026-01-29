import {DragCard} from "@/pages/transfers/DragCard.tsx";
import {useState} from "react";

interface Props {

}

export const TransferRow = (props: Props) => {
    const {} = props;

    const [items, setItems] = useState<string[]>([]);

    return (
        <>
            <tr>
                <td>
                    <DragCard name={'СЗМК'} variant={'ORGANISATION'}/>
                </td>

                <td>
                    <DragCard name={'СЗМК'} variant={'ORGANISATION'}/>
                </td>
            </tr>
        </>
    );
};
