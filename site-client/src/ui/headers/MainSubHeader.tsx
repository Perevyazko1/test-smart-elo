import {cx} from "@/utils/class-builder";

interface MainSubHeaderProps {
    text: string;
}

export const MainSubHeader = (props: MainSubHeaderProps) => {
    const {text} = props;

    return (
        <h3 className={cx([
            'text-20',
            'sm:text-24',
            'md:text-26',
            'lg:text-28',
            'xl:'
        ])}>
            {text}
        </h3>
    );
};