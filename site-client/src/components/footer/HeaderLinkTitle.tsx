import {cx} from "@/utils/class-builder";

interface HeaderLinkTitleProps {
    title: string;
    className?: string;
}

export const HeaderLinkTitle = (props: HeaderLinkTitleProps) => {
    const {title, className=''} = props;

    return (
        <h3 className={cx([
            'text-17 mb-20',
            'sm:text-20 md:mb-25',
            'md:text-22 md:mb-30',
            'lg:mb-30',
            'xl:',
            className
        ])}>{title}</h3>
    );
};