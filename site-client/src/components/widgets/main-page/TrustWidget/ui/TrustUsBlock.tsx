import {cx} from "@/utils/class-builder";

interface TrustUsBlockProps {
    title: string;
    text: string;
    count: string;
    className: string;
}

export const TrustUsBlock = (props: TrustUsBlockProps) => {
    const {count, text, title, className} = props;

    return (
        <div className={cx([
            'flex flex-col',
            'sm:px-87',
            'md:px-0',
            'lg:',
            'xl:',
            className
        ])}>
            <div className={cx([
                'flex justify-between items-center mb-9 relative',
                'sm:mb-16',
                'md:mb-16',
                'lg:mb-10',
                'xl:'
            ])}>
                <span className={cx([
                    'text-16 relative flex justify-between items-center',
                    'sm:text-22',
                    'md:text-22',
                    'lg:text-22',
                    'xl:'
                ])}>
                    {title}
                </span>
                <span className={cx([
                    'text-26 fw-thin',
                    'sm:text-38',
                    'md:text-38',
                    'lg:text-38 lg:absolute lg:left-[-102px] lg:top-0',
                    'xl:'
                ])}>
                    {count}
                </span>
            </div>
            <hr className={cx([
                'mb-12',
                'sm:mb-20',
                'md:mb-20',
                'lg:mb-30',
                'xl:'
            ])}/>

            <p className={cx([
                'text-10',
                'sm:text-14',
                'md:text-14',
                'lg:text-16',
                'xl:'
            ])}>{text}</p>
        </div>
    );
};