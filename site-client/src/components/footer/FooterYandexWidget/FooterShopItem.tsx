import {cx} from "@/utils/class-builder";
import {AppIcon, ICONS} from "@/ui/icons/AppIcon";

interface FooterShopItemProps {
    address: string;
}

export const FooterShopItem = (props: FooterShopItemProps) => {
    const {address} = props;

    return (
        <li className={cx([
            'flex gap-x-16 text-10',
            'sm:text-12',
            'md:text-14 md:gap-x-20',
            'lg:text-14',
            'xl:'
        ])}>
            <AppIcon
                icon={ICONS.POINT}
                className={cx([
                'h-18 w-14',
                'sm:',
                'md:w-19 md:h-24',
                'lg:w-23 lg:h-29',
                'xl:'
            ])}/>
            <div className={cx([
                'flex flex-col gap-10',
                'sm:',
                'md:gap-15',
                'lg:',
                'xl:'
            ])}>
                <span>
                    {address}
                </span>
                <span className={'underline underline-offset-2 text-b_64 cursor-pointer'}>
                    Подробнее
                </span>
            </div>
        </li>
    );
};