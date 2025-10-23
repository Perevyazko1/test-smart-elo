import type {HTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";
import {useShowCoins} from "@/shared/state/payroll/showCoins.ts";


interface NiceNumProps extends HTMLAttributes<HTMLDivElement> {
    value: number | null;
    abs?: boolean;
}

export const NiceNum = (props: NiceNumProps) => {
    const {value, className, abs = false, ...otherProps} = props;
    const showCoins = useShowCoins(s => s.showCoins);

    const integerPart = value ? Math.floor(Math.abs(
        showCoins ? value / 100 :
        Math.round(value / 100)
    )) : 0;

    const fractionalPart = value ? String(Math.abs(value) % 100).padStart(2, '0') : '00';

    return (
        <div
            className={twMerge(
                'monospace font-mono',
                value === null ? 'text-gray-100' : 'text-black',
                className
            )}
            {...otherProps}
        >
            {value === null ? (showCoins ? "0.00" : "0") :
                (<>
                    <span>
                        {(!abs && value < 0) ? '-' : ''}
                        {integerPart.toLocaleString('ru-RU')}
                    </span>
                    {showCoins && (
                        <sup
                            className={
                                fractionalPart === '00' ?
                                    'text-gray-400' :
                                    'text-black'
                            }
                        >
                            .{fractionalPart}
                        </sup>
                    )}
                </>)
            }
        </div>
    );
};