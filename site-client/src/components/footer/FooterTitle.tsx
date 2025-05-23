import {cx} from "@/utils/class-builder";

interface FooterTitleProps {
    title: string;
}

export const FooterTitle = (props: FooterTitleProps) => {
    const {title} = props;

    return (
        <h2 className={cx([
            'text-20',
            'sm:text-24',
            'md:text-26',
            'lg:text-28',
            'xl:'
        ])}>
            {title}
        </h2>
    );
};