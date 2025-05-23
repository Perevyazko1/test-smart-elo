"use client"
import Image from "next/image";
import {HTMLAttributes, ReactNode, useId, useRef, useState} from "react";

import {cx} from "@/utils/class-builder";
import {SliderItem} from "@/ui/slider/SliderItem";


interface SliderProps extends HTMLAttributes<HTMLDivElement> {
    items: ReactNode[];
}


export const Slider = (props: SliderProps) => {
    const {items} = props;
    const [showIndex, setShowIndex] = useState<number[]>([]);
    const id = useId();
    const ref = useRef(null);

    const addIndex = (index: number) => {
        setShowIndex(prevState => {
            return [index, ...prevState]
                .sort((a, b) => a - b);
        });
    };

    const removeIndex = (index: number) => {
        setShowIndex(prevState => {
            return [...prevState].filter(item => item !== index)
                .sort((a, b) => a - b);
        })
    };

    const nextItem = () => {
        const targetId = Math.min(showIndex[showIndex.length - 1], showIndex[0] + 2);
        const element = document.getElementById(`${id}-${targetId}`);
        if (!element) return
        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        })
    }

    const previousItem = () => {
        const targetId = Math.max(showIndex[0] - 2, 0);
        const element = document.getElementById(`${id}-${targetId}`);
        if (!element) return
        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        })
    }

    return (
        <div className={'relative max-w-full'}>
            <div className={cx([
                'flex flex-nowrap gap-15 justify-end',
                'sm:gap-30',
                'md:gap-45',
                'lg:gap-55',
                'xl:'
            ])}>
                <button
                    onClick={previousItem}
                    className={cx([
                        'pt-10 pb-25 active:scale-95 transition-all',
                        'sm:pb-35',
                        'md:pb-45',
                        'lg:pb-45',
                        'xl:'
                    ])}
                >
                    <Image
                        src={'icons/arrow_slider_right.svg'}
                        alt={"Предыдущий"}
                        width={80}
                        height={14}
                        className={cx([
                            'rotate-180 w-40',
                            'sm:w-50',
                            'md:w-80',
                            'lg:w-80',
                            'xl:'
                        ])}
                    />
                </button>
                <button
                    onClick={nextItem}
                    className={cx([
                        'pt-10 pb-25 active:scale-95 transition-all',
                        'sm:pb-35',
                        'md:pb-45',
                        'lg:pb-45',
                        'xl:'
                    ])}
                >
                    <Image
                        src={'icons/arrow_slider_right.svg'}
                        alt={"Предыдущий"}
                        width={80}
                        height={14}
                        className={cx([
                            'w-40',
                            'sm:w-50',
                            'md:w-80',
                            'lg:w-80',
                            'xl:'
                        ])}
                    />
                </button>
            </div>
            <article
                ref={ref}
                className={cx([
                    'flex flex-nowrap max-w-full overflow-x-scroll gap-8 pb-25',
                    'sm:pb-30 sm:gap10',
                    'md:pb-40 md:gap-15',
                    'lg:pb-55 lg:gap-18',
                    'xl:',
                    'snap-x snap-mandatory overscroll-x-contain scroll-smooth thinXScroll',
                ])}
            >
                {items.map((item, index) => (
                    <SliderItem
                        onShow={(index) => addIndex(index)}
                        onHide={(index) => removeIndex(index)}
                        item={item}
                        key={index}
                        id={`${id}-${index}`}
                        itemId={index}
                    />
                ))}
            </article>
        </div>
    );
};