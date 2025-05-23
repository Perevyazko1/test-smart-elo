import {cx} from "@/utils/class-builder";

interface PageHeaderProps {
    title: string;
}

export const PageHeader = (props: PageHeaderProps) => {
    const {title} = props;

    return (
        <h1 className={cx([
            'text-20 mb-20',
            'sm:text-24 sm:mb-25',
            'md:text-28 md:mb-40',
            'lg:mb-35',
            'xl:'
        ])}>{title}</h1>
    );
};