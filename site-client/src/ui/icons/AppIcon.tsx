import Image from "next/image";
import {ReactNode} from "react";
import {twMerge} from "tailwind-merge";

interface IconType {
    path: string;
    alt: string;
}

class Icons {
    POINT: IconType = {path: '/icons/point.svg', alt: "Адрес"}
    MENU: IconType = {path: '/icons/menu_icon.svg', alt: "Меню"}
    PRINT: IconType = {path: '/icons/print.svg', alt: "Печать"}
    CLOSE_ALT: IconType = {path: '/icons/close_v2.svg', alt: "Закрыть"}
    CLOSE: IconType = {path: '/icons/close.svg', alt: "Закрыть"}
    PHONE: IconType = {path: '/icons/phone.svg', alt: "Телефон"}
    SAVE: IconType = {path: '/icons/save.svg', alt: "Сохранить"}
    USER: IconType = {path: '/icons/user.svg', alt: "Пользователь"}
    EMAIL: IconType = {path: '/icons/email.svg', alt: "Почта"}
    YOU_TUBE: IconType = {path: '/icons/yt.svg', alt: "YouTube"}
    GRID_4: IconType = {path: '/icons/grid_4.svg', alt: "Карточки"}
    PHOTO: IconType = {path: '/icons/photo.svg', alt: "Фото"}
    DONE: IconType = {path: '/icons/done.svg', alt: "Фото"}
    SEARCH: IconType = {path: '/icons/search.svg', alt: "Фото"}
}

export const ICONS = new Icons();

interface AppIconProps {
    className?: string;
    icon: IconType;
}

export const AppIcon = (props: AppIconProps): ReactNode => {
    const {className = "", icon} = props;

    return (
        <div className={twMerge('relative w-full h-full', className)}>
            <Image className={'object-fill'} src={icon.path} alt={icon.alt} fill/>
        </div>
    );
};