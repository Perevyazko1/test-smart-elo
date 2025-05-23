import {HTMLAttributes} from "react";
import {cx} from "@/utils/class-builder";
import {HoverUnderline} from "@/ui/src/HoverUnderline";

export const ComingSoon = (props: HTMLAttributes<HTMLDivElement>) => {
    const {children, className = ""} = props;

    return (
        <div className={cx([
            'soon relative group sm:block select-none transition-all cursor-pointer hidden',
            className
        ])}>
            <div className={'w-full bg-transparent pointer-events-none group-hover:scale-0 transition-all'}>
                {children}
            </div>
            <div className={cx([
                'w-full h-full transition-all absolute flex justify-center items-center text-10 top-0 left-0 text-nowrap opacity-0 bg-b_FF',
                'group-hover:opacity-100',
                'sm:',
                'md:text-14',
                'lg:text-16',
            ])}>
                <span> 🛋 </span>
                <span className={'hidden sm:block'}>Скоро 🛋</span>
                <HoverUnderline/>
            </div>
        </div>
    );
};