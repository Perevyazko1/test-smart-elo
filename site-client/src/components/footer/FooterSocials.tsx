import {cx} from "@/utils/class-builder";
import {AppIcon, ICONS} from "@/ui/icons/AppIcon";

export const FooterSocials = () => {

    return (
        <span className={cx([
            'flex gap-15',
            'sm:absolute sm:-bottom-5 sm:-right-5',
            'md:',
            'lg:',
            'xl:'
        ])}>
            {/*<Image src={'/icons/wa.svg'} alt={'WhatsApp'} height={23} width={23}/>*/}
            {/*<Image src={'/icons/tg.svg'} alt={'Telegram'} height={23} width={23}/>*/}

            <a href="mailto:c3mk@mail.ru">
                <AppIcon icon={ICONS.EMAIL} className={'h-23 w-23'}/>
            </a>
            <a href="https://www.youtube.com/@szmk_social" target={'_blank'}>
                <AppIcon icon={ICONS.YOU_TUBE} className={'h-23 w-23'}/>
            </a>
        </span>
    );
};