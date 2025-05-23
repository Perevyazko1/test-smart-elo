import {PageContainer} from "@/ui/containers/PageContainer";
import {cx} from "@/utils/class-builder";
import {TrustWidget} from "@/components/widgets/main-page/TrustWidget/TrustWidget";
import {AboutWidget} from "@/components/widgets/main-page/AboutWidget/AboutWidget";
import {ProjectsWidget} from "@/components/widgets/main-page/ProjectsWidget/ProjectsWidget";
import {PossibilitiesWidget} from "@/components/widgets/main-page/PossibilitiesWidget/PossibilitiesWidget";
import {NewParallax} from "@/ui/containers/NewParallax";


const Home = async () => {

    return (
        <PageContainer className={cx([
            'flex flex-col gap-40',
            'sm:gap-50',
            'md:gap-70',
            'lg:gap-80',
            'xl:'
        ])}>
            <div>
                <h1 className={cx([
                    'text-22 mb-20',
                    'sm:text-26 lg:mb-25',
                    'md:text-28 lg:mb-30',
                    'lg:text-38 lg:mb-35',
                    'xl:'
                ])}>
                    ООО &quot;Северо-Западная Мебельная Компания&quot;
                </h1>
                <NewParallax
                    src={'/images/main.png'}
                    alt={'Главная'}
                    className={'h-[185px] sm:h-[360px] md:h-[532px] lg:h-[570px] xl:h-[670px]'}
                />
            </div>

            <TrustWidget/>

            <AboutWidget/>

            <ProjectsWidget/>

            <PossibilitiesWidget/>

        </PageContainer>
    );
}

export default Home;