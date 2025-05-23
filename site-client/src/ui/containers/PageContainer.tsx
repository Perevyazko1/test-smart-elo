import {HTMLAttributes} from "react";
import {cx} from "@/utils/class-builder";


export const PageContainer = (props: HTMLAttributes<HTMLDivElement>) => {
    const {children, className = '', ...otherProps} = props;

    return (
        <main className={cx([
            'pt-15 pb-40',
            'sm:pt-20 sm:pb-50',
            'md:pt-35 md:pb-70',
            'lg:pt-35 lg:pb-80',
            'xl:',
            className
        ])} {...otherProps}>
            {children}
        </main>
    );
};