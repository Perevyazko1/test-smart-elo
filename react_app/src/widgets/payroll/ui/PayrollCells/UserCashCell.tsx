import {DotFilledIcon} from "@radix-ui/react-icons";

import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {PriceInputForm} from "@/shared/ui/inputs/PriceInputForm.tsx";


interface UserCashCellProps {
    disabled: boolean;
    isLoading: boolean;
}


export const UserCashCell = (props: UserCashCellProps) => {
    const {disabled, isLoading} = props;


    return (
        <td className="max-w-[7em] relative">
            {isLoading && (
                <DotFilledIcon
                    className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                />
            )}

            <TT description={'Сумма к дальнейшей выдаче наличкой и ИП'}>
                <PriceInputForm
                    disabled={disabled}
                    className={'w-full outline-none h-full bg-yellow-50 disabled:bg-transparent'}
                    name={'cash_payout'}
                />
            </TT>
        </td>
    );
};