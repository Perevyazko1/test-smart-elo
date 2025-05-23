import {HTMLAttributes} from "react";
import {cx} from "@/utils/class-builder";


export const TypographyContent = (props: HTMLAttributes<HTMLDivElement>) => {
    const {children} = props;

    return (
        <section className={cx([
            'flex flex-col gap-40 px-10',
            'sm:px-15 sm:gap-50',
            'md:px-[120px] md:gap-70',
            'lg:px-[165px] lg:gap-45',
            'xl:'
        ])}>
            {children}
        </section>
    );
};