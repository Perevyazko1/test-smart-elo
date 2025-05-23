"use client"
import Image from "next/image";
import {twMerge} from "tailwind-merge";
import {useParallax} from "@/utils/use-parallax";

interface NewParallaxProps {
    className: string;
    src: string;
    alt: string;
}

export const NewParallax = (props: NewParallaxProps) => {
    const {className, src, alt} = props;

    const {ref, style, initialized} = useParallax({
        speed: 0.1,
        maxBlur: 20,
        scale: 1.1,
        clampFactor: 1.0,
    });

    return (
        <div className={twMerge(
            'relative overflow-hidden',
            !initialized && "bg-b_E3 animate-pulse",
            className,
        )}>
            <Image
                src={src}
                alt={alt}
                fill
                ref={ref}
                style={style}
                // quality={100}
                sizes="100vw"
                className={'object-cover'}
            />
        </div>
    );
};