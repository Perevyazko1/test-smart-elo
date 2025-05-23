import {cx} from "@/utils/class-builder";
import {HeaderLogo} from "@/components/navbar/HeaderLogo";
import {FooterLinks} from "@/components/footer/FooterLinks";
import {PAGES} from "@/config/public-page.config";
import {HeaderLinkTitle} from "@/components/footer/HeaderLinkTitle";
import {FooterUl} from "@/components/footer/FooterUl";
import {FooterLi} from "@/components/footer/FooterLi";
import {FooterSocials} from "@/components/footer/FooterSocials";
import {ComingSoon} from "@/ui/src/ComingSoon";

export const FooterLinksBlock = () => {

    return (
        <section className={cx([
            'mb-21 gap-y-23 gap-x-45 flex flex-wrap justify-start',
            'sm:gap-x-55 sm:mb-34 sm:justify-between',
            'md:',
            'lg:',
            'xl:'
        ])}>
            <nav className={cx([
                'w-full',
                'sm:',
                'md:w-auto',
                'lg:',
                'xl:'
            ])}>
                <HeaderLogo/>
            </nav>
            <FooterLinks
                className={cx([
                    'order-2 flex-1',
                    'sm:order-3 sm:flex-none',
                    'md:',
                    'lg:',
                    'xl:'
                ])}
                title={'Покупателям'}
                links={[PAGES.ABOUT, PAGES.PROJECTS, PAGES.HOME, PAGES.DOCUMENTS]}
            />
            {/*<FooterLinks*/}
            {/*    className={cx([*/}
            {/*        'order-3',*/}
            {/*        'sm:order-2',*/}
            {/*        'md:',*/}
            {/*        'lg:',*/}
            {/*        'xl:'*/}
            {/*    ])}*/}
            {/*    title={'Каталог'}*/}
            {/*    links={[*/}
            {/*        CATALOGUE.MAIN,*/}
            {/*        CATALOGUE.IN_STOCK,*/}
            {/*        CATALOGUE.NEW,*/}
            {/*        CATALOGUE.SOFAS,*/}
            {/*        CATALOGUE.ARMCHAIRS,*/}
            {/*        CATALOGUE.TABLES,*/}
            {/*        CATALOGUE.CHAIRS,*/}
            {/*        CATALOGUE.BEDS,*/}
            {/*        CATALOGUE.POUFS,*/}
            {/*        CATALOGUE.INTERIOR,*/}
            {/*        CATALOGUE.WOOD,*/}
            {/*    ]}*/}
            {/*/>*/}

            <nav className={cx([
                'order-last relative',
                'sm:',
                'md:',
                'lg:',
                'xl:'
            ])}>
                <HeaderLinkTitle title={'Контакты'}/>
                <FooterUl>
                    <ComingSoon>
                        <FooterLi>Магазины</FooterLi>
                    </ComingSoon>
                    <ComingSoon>
                        <FooterLi>Шоу-румы</FooterLi>
                    </ComingSoon>
                    <FooterLi>г. Санкт-Петербург, ул. Курляндская, 49</FooterLi>
                    <FooterLi>c3mk@mail.ru</FooterLi>
                    <FooterSocials/>
                </FooterUl>
            </nav>
        </section>
    );
};