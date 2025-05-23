import {cx} from "@/utils/class-builder";

interface ParagraphItemProps {
    title: string;
    text: string;
}

export const ParagraphItem = (props: ParagraphItemProps) => {
    const {text, title} = props;

    return (
        <p className={cx([
            'text-10 mb-4',
            'sm:text-12',
            'md:text-16',
            'lg:',
            'xl:'
        ])}>
            <b>{title}</b> - {text}; <br/>
        </p>
    );
};