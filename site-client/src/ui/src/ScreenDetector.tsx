"use client"
import {cx} from "@/utils/class-builder";


export const ScreenDetector = () => {

    return (
        <div className={'fixed bottom-12 right-12 z-50'}>
            <span className={cx([
                'block',
                'sm:hidden',
                'md:hidden',
                'lg:hidden',
                'xl:hidden'
            ])}>
                M📱
            </span>
            <span className={cx([
                'hidden',
                'sm:block text-3xl',
                'md:hidden',
                'lg:hidden',
                'xl:hidden'
            ])}>
                SM📋
            </span>
            <span className={cx([
                'hidden',
                'sm:hidden',
                'md:block text-5xl',
                'lg:hidden',
                'xl:hidden'
            ])}>
                MD💻
            </span>
            <span className={cx([
                'hidden',
                'sm:hidden',
                'md:hidden',
                'lg:block text-7xl',
                'xl:hidden'
            ])}>
                LG🖥️
            </span>
            <span className={cx([
                'hidden',
                'sm:hidden',
                'md:hidden',
                'lg:hidden',
                'xl:block text-9xl'
            ])}>
                XL📺
            </span>
        </div>
    );
};