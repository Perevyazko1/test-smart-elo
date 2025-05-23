import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";

export const FooterLi = (props: HTMLAttributes<HTMLLinkElement>) => {
    const {children, className = ""} = props;

    return (
        <li className={cx([
            'text-b_64 text-10 text-nowrap min-w-[fit-content]',
            'sm:text-12',
            'md:text-14',
            'lg:text-16',
            'xl:',
            className
        ])}>
            {children}
        </li>
    );
};