import {MainSubHeader} from "@/ui/headers/MainSubHeader";
import {SectionWrapper} from "@/components/widgets/main-page/wrappers/SectionWrapper";
import {cx} from "@/utils/class-builder";
import {TrustImage} from "@/components/widgets/main-page/TrustWidget/ui/TrustImage";
import {TrustUsBlock} from "@/components/widgets/main-page/TrustWidget/ui/TrustUsBlock";
import {TrustWrapper} from "@/components/widgets/main-page/TrustWidget/ui/TrustWrapper";
import {TrustTextWrapper} from "@/components/widgets/main-page/TrustWidget/ui/TrustTextWrapper";

export const TrustWidget = () => {

    return (
        <SectionWrapper className={cx([
            '',
            'sm:gap-35',
            'md:gap-40',
            'lg:gap-45',
            'xl:'
        ])}>
            <MainSubHeader text={'Почему нам доверяют'}/>

            <div className={cx([
                'grid grid-cols-2 gap-20',
                'sm:gap-35',
                'md:gap-35',
                'lg:gap-10',
                'xl:'
            ])}>
                <TrustWrapper>
                    <TrustImage
                        imgSrc={'/images/trust_5.jpg'}
                        alt={'О нас'}
                        className={cx([
                            'order-first',
                            'sm:',
                            'md:',
                            'lg:order-last',
                            'xl:'
                        ])}
                    />

                    <TrustTextWrapper>
                        <TrustUsBlock
                            title={"Сильный конструкторский отдел"}
                            text={"Мы гордимся тем, что наш отдел конструкторов является одним из лучших в индустрии. Наша команда может превратить вашу идею в реальность, разработать детальные чертежи и прототипы."}
                            count={"01"}
                            className={'lg:ps-[102px] lg:pe-[160px]'}
                        />
                        <TrustUsBlock
                            title={"Лазерное оборудование"}
                            text={"Да, вы правильно поняли! Мы используем лазерные чпу станки для раскроя мебели. Это обеспечивает высокую точность, минимальные потери материала и возможность создавать сложные изделия с идеальной геометрией."}
                            count={"02"}
                            className={'lg:ps-[102px] lg:pe-[160px]'}
                        />
                    </TrustTextWrapper>
                </TrustWrapper>

                <TrustWrapper>
                    <TrustImage
                        imgSrc={'/images/trust_3.jpg'}
                        alt={'О нас'}
                        className={cx([
                            'order-first',
                            'sm:',
                            'md:order-last',
                            'lg:order-first',
                            'xl:'
                        ])}
                    />

                    <TrustTextWrapper className={'lg:mt-40'}>
                        <TrustUsBlock
                            title={"Сложные изделия? – Легко!"}
                            text={"Неважно, на сколько сложен ваш запрос. Благодаря нашим технологиям и опыту, мы можем воплотить в жизнь самые сложные и уникальные проекты."}
                            count={"03"}
                            className={'lg:ps-[183px] lg:pe-79'}
                        />
                        <TrustUsBlock
                            title={"От чертежа до реализации"}
                            text={"У нас есть уникальная способность «читать» изображения и фотографии. Вы можете предоставить нам скетч или фотографию желаемого изделия, и мы воплотим его в реальность."}
                            count={"04"}
                            className={'lg:ps-[183px] lg:pe-79'}
                        />
                    </TrustTextWrapper>
                </TrustWrapper>
            </div>
        </SectionWrapper>

    );
};