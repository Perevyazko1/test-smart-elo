import {cx} from "@/utils/class-builder";

interface FooterShopTitleProps {
    title: string;
}

export const FooterShopTitle = (props: FooterShopTitleProps) => {
    const {title} = props;

    return (
        <h3 className={cx([
            'text-17 mb-15',
            'sm:text-20',
            'md:text-22 md:mb-25',
            'lg:mb-35',
            'xl:'
        ])}>{title}</h3>
    );
};