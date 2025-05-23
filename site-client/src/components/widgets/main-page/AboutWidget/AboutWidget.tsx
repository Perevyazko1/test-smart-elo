import {cx} from "@/utils/class-builder";
import {MainSubHeader} from "@/ui/headers/MainSubHeader";
import {LinkBtm} from "@/ui/buttons/LinkBtm";
import {PAGES} from "@/config/public-page.config";
import {SectionWrapper} from "@/components/widgets/main-page/wrappers/SectionWrapper";
import {NewParallax} from "@/ui/containers/NewParallax";


export const AboutWidget = () => {
    return (
        <SectionWrapper className={cx([
            '',
            'sm:gap-35',
            'md:gap-40',
            'lg:gap-45',
            'xl:'
        ])}>
            <MainSubHeader text={'Наше производство'}/>

            <div>
                <div className={cx([
                    'grid grid-cols-3 gap-5 mb-20 w-full',
                    'sm:gap-10 sm:mb-30',
                    'md:gap-18 md:mb-35',
                    'lg:gap-20 lg:mb-45',
                    'xl:'
                ])}>
                    <NewParallax
                        src={"/images/cube_exmpl.jpg"}
                        alt={"Наше производство"}
                        className={cx([
                            'h-[130px] col-span-1 w-full',
                            'sm:h-[235px]',
                            'md:h-[310px]',
                            'lg:h-[455px]',
                        ])}
                    />
                    <NewParallax
                        src={"/images/wide_exmpl.jpg"}
                        alt={"Наше производство"}
                        className={cx([
                            'h-[130px] col-span-2 w-full',
                            'sm:h-[235px]',
                            'md:h-[310px]',
                            'lg:h-[455px]',
                            'xl:'
                        ])}
                    />
                </div>

                <article className={cx([
                    'flex flex-col',
                    'sm:',
                    'md:',
                    'lg:flex lg:flex-row lg:gap-[342px]',
                    'xl:'
                ])}>
                    <p className={cx([
                        'text-10 mb-25',
                        'sm:text-14 sm:mb-35',
                        'md:text-16 md:mb-40',
                        'lg:text-16 lg:mb-0',
                        'xl:'
                    ])}>
                        Фабрика дизайнерской мебели CZMK находится
                        в Шлиссербурге. Наше производство – это площадь свыше
                        3000 м². Более 30 лет в мебельной индустрии – это не просто число. Это десятилетия накопленных
                        знаний, опыта, адаптации
                        к меняющимся требованиям рынка и тенденциям дизайна.
                        На протяжении этого времени мы совершенствовали свои методы, обучались новому и совершали
                        инновации,
                        чтобы оставаться на передовой мебельной индустрии.
                    </p>

                    <div className={cx([
                        '',
                        'sm:',
                        'md:self-end',
                        'lg:',
                        'xl:'
                    ])}>
                        <LinkBtm
                            item={PAGES.ABOUT}
                            text={'Ознакомиться'}
                        />
                    </div>
                </article>
            </div>

        </SectionWrapper>
    );
};