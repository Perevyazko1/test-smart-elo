import type {ButtonHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface BtnProps extends ButtonHTMLAttributes <HTMLButtonElement> {
}

export const Btn = (props: BtnProps) => {
    const {children, className = "", ...otherProps} = props;

    return (
        <button
            type={'button'}
            className={twMerge([
                `px-4 py-1 bg-white text-black cursor-pointer transition-all`,
                "active:translate-[1px]",
                "disabled:opacity-25 disabled:cursor-not-allowed",
                className
            ])}
            {...otherProps}
        >
            {children}
        </button>
    );
};