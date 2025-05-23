import {cx} from "@/utils/class-builder";
import {PossibilitiesItem} from "@/components/widgets/main-page/PossibilitiesWidget/PossibilitiesItem";
import {MainSubHeader} from "@/ui/headers/MainSubHeader";
import {LinkBtm} from "@/ui/buttons/LinkBtm";
import {PAGES} from "@/config/public-page.config";
import {SectionWrapper} from "@/components/widgets/main-page/wrappers/SectionWrapper";


export const PossibilitiesWidget = () => {
    return (
        <SectionWrapper className={cx([
            '',
            'sm:gap-35',
            'md:gap-40',
            'lg:gap-45',
            'xl:'
        ])}>
            <MainSubHeader text={'Наши возможности'}/>

            <div className={cx([
                'gap-x-10 grid grid-cols-2',
                'sm:grid-rows-[repeat(4,_auto)] sm:grid-flow-col',
                'md:',
                'lg:',
                'xl:'
            ])}>
                <PossibilitiesItem
                    imgSrc={'/images/possibilities_1.jpg'}
                    alt={'Возможности'}
                    title={'Мебель для комфорта и функциональности'}
                    text={'Одним из главных преимуществ нашей продукции является её мобильность. Вся наша мебель разработана таким образом, чтобы быть не только красивой и удобной, но и функциональной. Лёгкость конструкции облегчает процессы перестановки, чистки или транспортировки изделий.'}
                />

                <PossibilitiesItem
                    imgSrc={'/images/possibilities_2.jpg'}
                    alt={'Возможности'}
                    title={'Адаптация под каждого клиента'}
                    text={'Мы понимаем, что потребности каждого заказчика уникальны, и стремимся адаптировать каждое изделие под конкретные требования и условия использования. Наша мебель не просто служит долго, она идеально вписывается в пространство, делая его более функциональным и уютным.'}
                />
            </div>

            <div className={'mt-5 md:self-center'}>
                <LinkBtm
                    item={PAGES.ABOUT}
                    text={'Ознакомиться'}
                />
            </div>
        </SectionWrapper>
    );
};