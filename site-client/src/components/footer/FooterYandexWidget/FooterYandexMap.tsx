import {cx} from "@/utils/class-builder";
import {FooterShopWidget} from "@/components/footer/FooterYandexWidget/FooterShopWidget";
import {FooterMap} from "@/components/footer/FooterYandexWidget/FooterMap";


export const FooterYandexMap = () => {
    return (
        <section className={cx([
            'h-full relative mt-25 mb-35 pt-56 pe-83 pb-35 ps-15 max-h-[540px] w-full bg-b_F8 visibleSection flex flex-col',
            'sm:mt-30 sm:mb-50 sm:pt-35 sm:pe-0 sm:pb-35 sm:ps-25',
            'md:mt-40 md:mb-70 md:pt-55 md:pe-0 md:pb-55 md:ps-40',
            'lg:mt-50 lg:mb-80 lg:pt-103 lg:pe-0 lg:pb-103 lg:ps-50 lg:min-h-[440px]',
            'xl:min-h-[540px]'
        ])}>
            <FooterMap/>
            <FooterShopWidget/>
        </section>
    );
};