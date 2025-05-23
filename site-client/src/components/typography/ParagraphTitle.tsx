import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";


export const ParagraphTitle = (props: HTMLAttributes<HTMLHeadingElement>) => {
    const {children, className = "", ...otherProps} = props;

    return (
        <h2 className={cx([
            'text-16',
            'sm:text-20',
            'md:text-22',
            'lg:',
            'xl:',
            className,
        ])} {...otherProps}>
            {children}
        </h2>
    );
};