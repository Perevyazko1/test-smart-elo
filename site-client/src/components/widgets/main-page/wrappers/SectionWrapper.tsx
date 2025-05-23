import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";

export const SectionWrapper = (props: HTMLAttributes<HTMLDivElement>) => {
    const {children, className = '', ...otherProps} = props;

    return (
        <section
            className={cx([
                'flex flex-col flex-wrap gap-20',
                'sm:',
                'md:',
                'lg:',
                'xl:',
                className,
            ])}
            {...otherProps}
        >
            {children}
        </section>
    );
};