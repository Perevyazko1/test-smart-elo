import {ReactNode} from "react";
import {AppIcon, ICONS} from "@/ui/icons/AppIcon";


export interface PageItemInfo {
    link: string;
    publicName: string;
    icon?: ReactNode;
    soon: boolean;
    parent?: PageItemInfo;
}


class Pages {
    HOME: PageItemInfo = {
        link: '/',
        publicName: 'Главная страница',
        icon: <AppIcon icon={ICONS.POINT}/>,
        soon: false,
    }
    DOCUMENTS: PageItemInfo = {
        link: `${this.HOME.link}docs`,
        publicName: 'Документы',
        soon: false,
        parent: this.HOME,
        icon: <AppIcon icon={ICONS.PRINT}/>,
    }

    PUBLIC_OFFER: PageItemInfo = {
        link: `${this.DOCUMENTS.link}/public_offer`,
        publicName: 'Публичная оферта',
        soon: false,
        parent: this.DOCUMENTS,
    }
    PRIVACY_POLICY: PageItemInfo = {
        link: `${this.DOCUMENTS.link}/privacy_policy`,
        publicName: 'Политика конфиденциальности',
        soon: false,
        parent: this.DOCUMENTS,
    }
    PURCHASE_RULES: PageItemInfo = {
        link: `${this.DOCUMENTS.link}/purchase_rules`,
        publicName: 'Правила приобретения товаров',
        soon: false,
        parent: this.DOCUMENTS,
    }

    WARRANTY: PageItemInfo = {
        link: '/warranty',
        publicName: 'Гарантия',
        soon: true,
        parent: this.HOME,
    }
    ABOUT: PageItemInfo = {
        link: '/about',
        publicName: 'О нас',
        soon: true,
        parent: this.HOME,
    }
    CART: PageItemInfo = {
        link: '/cart',
        publicName: 'Корзина',
        soon: true,
    }
    PROJECTS: PageItemInfo = {
        link: '/projects',
        publicName: 'Реализованные проекты',
        icon: <AppIcon icon={ICONS.PHOTO}/>,
        soon: false,
        parent: this.HOME,
    }

    FEEDBACK: PageItemInfo = {
        link: '/feedback',
        publicName: 'Обратная связь',
        soon: true,
        parent: this.HOME,
    }
    DELIVERY: PageItemInfo = {
        link: '/delivery',
        publicName: 'Доставка',
        soon: true,
        parent: this.HOME,
    }
    CATALOGUE: PageItemInfo = {
        link: '/catalogue',
        publicName: 'Каталог',
        soon: true,
        parent: this.HOME,
    }
}

export const PAGES = new Pages();
