import {cx} from "@/utils/class-builder";

export const FooterDivider = () => {
    return (
        <hr className={cx([
            'mb-10',
            'sm:mb-12',
            'md:mb-20',
            'lg:mb-25',
            'xl:'
        ])}/>
    );
};