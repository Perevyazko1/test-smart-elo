import {cx} from "@/utils/class-builder";
import {NewParallax} from "@/ui/containers/NewParallax";

interface PossibilitiesWidgetProps {
    imgSrc: string;
    alt: string;
    title: string;
    text: string;
}

export const PossibilitiesItem = (props: PossibilitiesWidgetProps) => {
    const {alt, imgSrc, text, title} = props;

    return (
        <>
            <NewParallax
                src={imgSrc}
                alt={alt}
                className={cx([
                    'object-cover h-[169px] mb-20 w-full col-span-2',
                    'sm:h-[216px] sm:mb-20 sm:col-span-1',
                    'md:h-[234px] md:mb-35',
                    'lg:h-[380px] lg:mb-45',
                    'xl:'
                ])}
            />

            <h4 className={cx([
                'text-17 mb-15 col-span-2',
                'sm:text-21 sm:mb-16 sm:col-span-1',
                'md:text-22 md:mb-20',
                'lg:text-22 lg:mb-25',
                'xl:'
            ])}>
                {title}
            </h4>

            <hr className={cx([
                'mb-15 col-span-2',
                'sm:mb-20 sm:col-span-1',
                'md:mb-20',
                'lg:mb-20',
                'xl:'
            ])}/>

            <p className={cx([
                'text-10 col-span-2 mb-20',
                'sm:text-14 sm:col-span-1 sm:pe-10',
                'md:text-16',
                'lg:text-16',
                'xl:'
            ])}>
                {text}
            </p>

        </>
    );
};