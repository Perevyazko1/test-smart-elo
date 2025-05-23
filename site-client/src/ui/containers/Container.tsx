import {cx} from "@/utils/class-builder";
import {HTMLAttributes} from "react";


export const Container = (props: HTMLAttributes<HTMLDivElement>) => {
    const {className = "", children, ...otherProps} = props;
    return (
        <div className={cx([
            'flex flex-col w-full items-center',
            'sm:',
            'md:',
            'lg:',
            'xl:',
            className
        ])} {...otherProps}>
            <div className={cx([
                'max-w-[120rem] w-full px-15',
                'sm:px-35',
                'md:px-35',
                'lg:px-40',
                'xl:px-40'
            ])}>
                {children}
            </div>
        </div>
    );
};