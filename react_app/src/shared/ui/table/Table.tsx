import type {TableHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface TableProps extends TableHTMLAttributes<HTMLTableElement>{

}

export const Table = (props: TableProps) => {
    const {children, className, ...otherProps} = props;

    return (
        <table
            className={twMerge(
                "min-w-full bg-white border border-gray-300 text-sm",
                className
            )}
            {...otherProps}
        >
            {children}
        </table>
    );
};