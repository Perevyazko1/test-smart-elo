import type {TableHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface TDProps extends TableHTMLAttributes<HTMLTableCellElement> {

}

export const TD = (props: TDProps) => {
    const {children, className, ...otherProps} = props;

    return (
        <td className={twMerge(
            "py-1 px-2 border border-gray-300",
            className
        )}
            {...otherProps}
        >
            {children}
        </td>
    );
};