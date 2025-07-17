import type {ThHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface PayrollThProps extends ThHTMLAttributes<HTMLTableCellElement>{

}

export const PayrollTh = (props: PayrollThProps) => {
    const {children, className = "", ...otherProps} = props;

    return (
        <th
            className={twMerge([
                "py-1 px-2 border-b border-gray-300 text-left",
                className
            ])}
            {...otherProps}
        >
            {children}
        </th>
    );
};