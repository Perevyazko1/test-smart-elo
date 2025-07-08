import type {TableHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface THeadProps extends TableHTMLAttributes<HTMLTableSectionElement> {

}

export const THead = (props: THeadProps) => {
    const {children, className, ...otherProps} = props;

    return (
        <thead
            className={twMerge(
                "bg-gray-50 text-nowrap",
                className
            )}
            {...otherProps}
        >
        {children}
        </thead>
    );
};