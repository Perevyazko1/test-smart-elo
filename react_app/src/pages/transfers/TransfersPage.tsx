import {CustomDragLayer} from "@/pages/transfers/CustomDragLayer.tsx";
import {TransferWidget} from "@/pages/transfers/TransferWidget.tsx";

interface Props {

}


export const TransfersPage = (props: Props) => {
    const {} = props;


    return (
        <div className={'p-4'}>
            <CustomDragLayer/>
            <div className={'flex flex-col gap-4 bg-yellow-50 p-4 border-2 border-black'}>
                <h1>Переводы</h1>

                <TransferWidget/>
            </div>
        </div>
    );
};
