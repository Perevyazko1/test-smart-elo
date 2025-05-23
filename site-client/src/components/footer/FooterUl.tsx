import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";


export const FooterUl = (props: HTMLAttributes<HTMLUListElement>) => {
    const {children, className = ""} = props;

    return (
        <ul className={cx([
            'gap-y-15 gap-x-43 grid grid-flow-col grid-rows-6 min-w-[fit-content]',
            'sm:gap-x-46',
            'md:gap-x-58 md:gap-y-20',
            'lg:gap-x-46',
            'xl:',
            className,
        ])}>
            {children}
        </ul>
    );
};