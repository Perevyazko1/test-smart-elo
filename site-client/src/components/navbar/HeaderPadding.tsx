import {cx} from "@/utils/class-builder";

export const HeaderPadding = () => {
    return (
        <div className={cx([
            'h-[7.5px]',
            'sm:h-6',
            'md:h-[12.5px]',
            'lg:h-[17.5px]',
            'xl:h-[17.5px]',
        ])}/>
    );
};