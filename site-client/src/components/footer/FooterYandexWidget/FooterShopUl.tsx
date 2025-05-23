import {HTMLAttributes} from "react";
import {cx} from "@/utils/class-builder";

export const FooterShopUl = (props: HTMLAttributes<HTMLUListElement>) => {
    const {children, className = ""} = props;

    return (
        <ul className={cx([
            'flex flex-col gap-10',
            'sm:gap-15',
            'md:gap-20',
            'lg:gap-25',
            'xl:',
            className,
        ])}>
            {children}
        </ul>
    );
};