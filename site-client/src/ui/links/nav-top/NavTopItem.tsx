import Link from "next/link";
import {cx} from "@/utils/class-builder";
import {PageItemInfo} from "@/config/public-page.config";
import {HoverUnderline} from "@/ui/src/HoverUnderline";


interface NavTopItemProps {
    item: PageItemInfo;
}


export const NavTopItem = (props: NavTopItemProps) => {
    const {item} = props;

    return (
        <li className={'group hidden sm:block'}>
            <Link href={item.link} className={cx([
                'flex flex-wrap gap-x-10 items-center',
                'sm:gap-x-10',
                'md:gap-x-15',
                'lg:gap-x-17',
            ])}>
                {item.icon && (
                    <span className={cx([
                        'max-w-17 max-h-17 opacity-75 group-hover:opacity-100 transition-opacity',
                        'sm:w-17 sm:h-17',
                        'md:w-21 md:h-21',
                    ])}>
                        {item.icon}
                    </span>
                )}
                <span className={cx([
                    'hidden relative',
                    'sm:block sm:text-10',
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