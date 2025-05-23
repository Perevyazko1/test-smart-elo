import {PageItemInfo} from "@/config/public-page.config";


class Catalogue {
    MAIN: PageItemInfo = {
        link: '/shop',
        publicName: 'Каталог',
        soon: true,
    }
    IN_STOCK: PageItemInfo = {
        link: `${this.MAIN.link}/?in_stock=true`,
        publicName: 'В наличии',
        soon: true,
    }
    NEW: PageItemInfo = {
        link: `${this.MAIN.link}/?new_furniture=true`,
        publicName: 'Новинки',
        soon: true,
    }

    typeFilter(types: string[]) {
        return `types=${types.join(',')}`
    }

    SOFAS: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['sofas'])}`,
        publicName: 'Диваны',
        soon: true,
    }
    ARMCHAIRS: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['armchairs'])}`,
        publicName: 'Кресла',
        soon: true,
    }
    TABLES: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['tables'])}`,
        publicName: 'Столы',
        soon: true,
    }
    CHAIRS: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['chairs'])}`,
        publicName: 'Стулья',
        soon: true,
    }
    BEDS: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['beds'])}`,
        publicName: 'Кровати и тахты',
        soon: true,
    }
    POUFS: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['poufs'])}`,
        publicName: 'Пуфы и банкетки',
        soon: true,
    }
    INTERIOR: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['interior'])}`,
        publicName: 'Предметы интерьера',
        soon: true,
    }
    WOOD: PageItemInfo = {
        link: `${this.MAIN.link}/?${this.typeFilter(['wood'])}`,
        publicName: 'Изделия из массива дерева',
        soon: true,
    }
}

export const CATALOGUE = new Catalogue();
