import type {HTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
}

export const Navbar = (props: NavbarProps) => {
    const {children, className = "", ...otherProps} = props;

    return (
        <div
            className={twMerge([
                "sticky top-0 left-0 right-0 z-10",
                "flex flex-row flex-nowrap items-center",
                "bg-black text-white",
                "h-10 gap-4 px-4",
                className
            ])}
            {...otherProps}
        >
            <div>
                СЗМК Зарплата
            </div>
            <div>
                Панель навигации
            </div>

            {children}
        </div>
    );
};