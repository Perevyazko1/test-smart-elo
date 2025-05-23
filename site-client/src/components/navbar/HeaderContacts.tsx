import {cx} from "@/utils/class-builder";
import {HoverUnderline} from "@/ui/src/HoverUnderline";
import {AppIcon, ICONS} from "@/ui/icons/AppIcon";

export const HeaderContacts = () => {
    return (
        <div className={cx([
            'flex-1 hidden text-10 gap-15 text-nowrap',
            'sm:flex',
            'md:text-14 gap-30',
            'lg:text-16 gap-40',
        ])}>
            <span className={cx([
                'flex gap-10 items-center group',
                'sm:',
                'md:gap-15',
                'lg:gap-17',
                'xl:'
            ])}>
                <AppIcon
                    icon={ICONS.SEARCH}
                    className={cx([
                        'w-17 h-17 opacity-75 group-hover:opacity-100 transition-opacity',
                        'sm:',
                        'md:w-15 md:h-20',
                        'lg:',
                        'xl:'
                    ])}
                />
                г. Санкт-Петербург
            </span>
            <a href="mailto:c3mk@mail.ru" className={'group'}>
                <span className={cx([
                    'flex gap-10 items-center opacity-75 group-hover:opacity-100 transition-opacity',
                    'sm:',
                    'md:gap-15',
                    'lg:gap-17',
                    'xl:'
                ])}>
                <AppIcon
                    icon={ICONS.EMAIL}
                    className={cx([
                        'w-16 h-17',
                        'sm:',
                        'md:w-18 md:h-20',
                        'lg:',
                        'xl:'
                    ])}/>
                    <span className={'relative'}>
                        c3mk@mail.ru
                        <HoverUnderline/>
                    </span>
                </span>
            </a>
        </div>
    );
};