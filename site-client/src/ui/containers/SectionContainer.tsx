import {HTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";


export const SectionContainer = (props: HTMLAttributes<HTMLDivElement>) => {
    const {className, children, ...otherProps} = props;

    return (
        <section className={twMerge([
            "max-h-[60dvh]",
            className
        ])} {...otherProps}>
            {children}
        </section>
    );
};