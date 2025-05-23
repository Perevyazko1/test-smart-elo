import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";

export const TrustWrapper = (props: HTMLAttributes<HTMLDivElement>) => {
    const {children, className = '', ...otherProps} = props;

    return (
        <section className={cx([
            'gap-y-20 col-span-2 grid grid-cols-2',
            'sm:gap-y-30',
            'md:gap-y-30 md:gap-x-21',
            'lg:gap-y-53',
            'xl:',
            className
        ])} {...otherProps}>
            {children}
        </section>
    );
};