import {ReactNode} from "react";
import {cx} from "@/utils/class-builder";

interface NumberedTextProps {
    title: ReactNode;
    items: ReactNode[];
}

export const NumberedText = (props: NumberedTextProps) => {
    const {title, items} = props;

    return (
        <li className={cx([
            'mb-40 text-16',
            'sm:text-20',
            'md:text-22',
            'lg:',
            'xl:'
        ])}>
            <h2 className={cx([
                'normal-case',
                'sm:',
                'md:',
                'lg:',
                'xl:'
            ])}>{title}</h2>

            <ol className={cx([
                'mt-20 text-10',
                'sm:text-12',
                'md:text-16',
                'lg:',
                'xl:'
            ])}>
                {items.map((item, index) => (
                    <li key={index} className={cx([
                        'mb-4',
                        'sm:',
                        'md:',
                        'lg:',
                        'xl:'
                    ])}>
                        {item}{typeof item === 'string' && ';'}
                    </li>
                ))}
            </ol>
        </li>
    );
};