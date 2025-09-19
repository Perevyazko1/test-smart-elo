import {DotFilledIcon} from "@radix-ui/react-icons";

import {TT} from "@/shared/ui/tooltip/TT.tsx";
import {PriceInputForm} from "@/shared/ui/inputs/PriceInputForm.tsx";
import {twMerge} from "tailwind-merge";


interface UserCashCellProps {
    disabled: boolean;
    isLoading: boolean;
    name: string;
    info: string;
    className?: string;
}


export const UserCashCell = (props: UserCashCellProps) => {
    const {disabled, isLoading, name, info, className = ""} = props;


    return (
        <td className={twMerge(
            "max-w-[7em] relative bg-blue-100",
            className
        )}>
            {isLoading && (
                <DotFilledIcon
                    className={'absolute top-0 right-0 text-green-800 animate-pulse'}
                />
            )}

            <TT description={info}>
                <PriceInputForm
                    disabled={disabled}
                    className={
                        twMerge(
                            'w-full outline-none h-full bg-yellow-50 disabled:bg-transparent',
                        )

                    }
                    name={name}
                />
            </TT>
        </td>
    );
};