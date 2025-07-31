import type {HTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";


interface NiceNumProps extends HTMLAttributes<HTMLDivElement> {
    value: number | null;
    abs?: boolean;
}

export const NiceNum = (props: NiceNumProps) => {
    const {value, className, abs=false, ...otherProps} = props;

    const integerPart = value ? Math.floor(Math.abs(value) / 100) : 0;
    const fractionalPart = value ? String(Math.abs(value) % 100).padStart(2, '0') : '00';

    return (
        <div
            className={twMerge(
                'monospace font-mono',
                className
            )}
            {...otherProps}
        >
            {value === null ? ("") :
                (<>
                    <span>
                        {(!abs && value < 0) ? '-' : ''}
                        {integerPart.toLocaleString('ru-RU')}
                    </span>
                    <span
                        className={
                        fractionalPart === '00' ?
                            'text-gray-400' :
                            'text-black'
                        }
                    >
                        .{fractionalPart}
                    </span>
                </>)
            }
        </div>
    );
};