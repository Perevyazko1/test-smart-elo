import type {ButtonHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface BtnProps extends ButtonHTMLAttributes <HTMLButtonElement> {
    bg?: "black" | "white" | "green";
}

export const Btn = (props: BtnProps) => {
    const {children, bg="black", className = "", ...otherProps} = props;

    return (
        <button
            type={'button'}
            className={twMerge([
                `px-4 py-1 bg-${bg} text-${bg === 'black' ? "white" : "black"} cursor-pointer transition-all`,
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