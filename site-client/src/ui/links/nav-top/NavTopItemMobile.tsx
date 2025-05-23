import {HTMLAttributes} from "react";
import Link from "next/link";
import {twMerge} from "tailwind-merge";

import {cx} from "@/utils/class-builder";
import {PageItemInfo} from "@/config/public-page.config";
import {HoverUnderline} from "@/ui/src/HoverUnderline";


interface NavTopItemMobileProps extends HTMLAttributes<HTMLLIElement> {
    item: PageItemInfo;
}


export const NavTopItemMobile = (props: NavTopItemMobileProps) => {
    const {item, className, ...otherProps} = props;

    return (
        <li className={twMerge('group', className)} {...otherProps}>
            <Link href={item.link} className={cx([
                'flex flex-wrap items-center gap-x-10',
                'sm:gap-x-10',
                'md:gap-x-15',
                'lg:gap-x-17',
            ])}>
                {item.icon && (
                    <span className={cx([
                        'w-13 h-17',
                        'sm:w-13 sm:h-17',
                        'md:w-16 md:h-21',
                    ])}>
                        {item.icon}
                    </span>
                )}
                <span className={cx([
                    'block relative',
                    'sm:text-10',
                    'md:text-14',
                    'lg:text-16',
                ])}>
                    {item.publicName}
                    <HoverUnderline/>
                </span>
            </Link>
        </li>
    );
};