import {twMerge} from "tailwind-merge";
import {NewParallax} from "@/ui/containers/NewParallax";

interface TrustImageProps {
    imgSrc: string;
    alt: string;
    className: string;
}

export const TrustImage = (props: TrustImageProps) => {
    const {imgSrc, alt, className} = props;

    return (
        <NewParallax
            src={imgSrc}
            alt={alt}
            className={
                twMerge(
                    'h-[169px] col-span-2 w-full sm:h-[313px] sm:mb-5 md:h-[313px] md:mb-0 md:col-span-1 lg:h-[389px]',
                    className
                )
            }
        />
    );
};


