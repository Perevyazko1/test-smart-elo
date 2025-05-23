import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";

export const TrustTextWrapper = (props: HTMLAttributes<HTMLDivElement>) => {
    const {children, className = '', ...otherProps} = props;

    return (
        <div className={cx([
            'col-span-2 grid gap-20',
            'sm:',
            'md:gap-40 md:col-span-1',
            'lg:pt-15',
            'xl:',
            className
        ])} {...otherProps}>
            {children}
        </div>
    );
};