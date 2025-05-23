import {cx} from "@/utils/class-builder";
import {FooterShopItem} from "@/components/footer/FooterYandexWidget/FooterShopItem";
import {FooterShopTitle} from "@/components/footer/FooterYandexWidget/FooterShopTitle";
import {FooterShopUl} from "@/components/footer/FooterYandexWidget/FooterShopUl";


export const FooterShopWidget = () => {
    return (
        <div className={cx([
            'relative flex flex-col max-w-[443px] min-w-[227px] bg-b_FF text-10 flex-1 overflow-hidden',
            'sm:text-12',
            'md:text-14',
            'lg:text-16',
        ])}>
            {/*<Image*/}
            {/*    src={'/icons/close.svg'}*/}
            {/*    alt={'Закрыть'}*/}
            {/*    height={23}*/}
            {/*    width={23}*/}
            {/*    className={cx([*/}
            {/*        'absolute w-13 h-13 top-19 right-20 cursor-pointer hover:scale-105',*/}
            {/*        'sm:top-26 sm:right-25',*/}
            {/*        'md:w-18 md:h-18 md:top-35',*/}
            {/*        'lg:w-23 lg:h-23 lg:top-50 lg:right-40',*/}
            {/*        'xl:'*/}
            {/*    ])}*/}
            {/*/>*/}
            <section className={cx([
                'overflow-auto flex flex-col flex-1 gap-21 thinYScroll py-15 px-20',
                'sm:gap-25 sm:py-20 sm:px-25',
                'md:gap-35 md:py-35 md:px-25',
                'lg:gap-60 lg:py-50 lg:px-40',
                'xl:'
            ])}>
                {/*<div>*/}
                {/*    <FooterShopTitle title={'Наши магазины'}/>*/}
                {/*    <FooterShopUl>*/}
                {/*        <FooterShopItem*/}
                {/*            address={'г. Санкт-Петербург, Невский пр-т, 114-116, ТК «Невский центр», 4 этаж'}/>*/}
                {/*    </FooterShopUl>*/}
                {/*</div>*/}

                <div>
                    <FooterShopTitle title={'Наше производство'}/>
                    <FooterShopUl>
                        <FooterShopItem
                            address={'187320, Ленинградская область, г.Шлиссельбург, ул.Красный Тракт, д.2'}/>
                    </FooterShopUl>
                </div>
            </section>
        </div>
    );
};