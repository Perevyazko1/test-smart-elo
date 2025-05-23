import {HTMLAttributes} from "react";
import Image from "next/image";
import {cx} from "@/utils/class-builder";


interface InputSearchProps extends HTMLAttributes<HTMLDivElement> {
    placeholder: string;
}

export const InputSearch = (props: InputSearchProps) => {
    const {placeholder, className = "", ...otherProps} = props;

    return (
        <div className={cx([
            'relative select-none h-26 w-[203px] text-10 min-w-[200px]',
            'sm:',
            'md:text-12 md:w-[310px] md:h-35',
            'lg:text-14 lg:w-[420px] lg:h-50',
            'xl:',
            className,
        ])} {...otherProps}>
            <input className={cx([
                'w-full h-full py-7 pe-10 ps-41 bg-b_F8',
                'sm:',
                'md:',
                'lg:',
                'xl:'
            ])} placeholder={placeholder} type={'text'}/>
            <span className={cx([
                'absolute pointer-events-none top-6 left-15 w-14 h-14',
                'sm:',
                'md:top-9 md:left-20',
                'lg:top-17 lg:left-19',
            ])}>
            <Image className={cx([
                'absolute opacity-70 pointer-events-none',
                'sm:',
                'md:',
                'lg:',
                'xl:'
            ])} src={'/icons/search.svg'} alt={'Поиск'} fill={true}/>
            </span>
        </div>
    );
};