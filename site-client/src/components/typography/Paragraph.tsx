import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";


export const Paragraph = (props: HTMLAttributes<HTMLParagraphElement>) => {
    return (
        <p className={cx([
            'text-10',
            'sm:text-12',
            'md:text-16',
            'lg:',
            'xl:'
        ])}>
            {props.children}
        </p>
    );
};