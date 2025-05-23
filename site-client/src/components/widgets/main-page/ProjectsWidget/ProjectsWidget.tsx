import {cx} from "@/utils/class-builder";
import {MainSubHeader} from "@/ui/headers/MainSubHeader";
import {LinkBtm} from "@/ui/buttons/LinkBtm";
import {PAGES} from "@/config/public-page.config";
import {SectionWrapper} from "@/components/widgets/main-page/wrappers/SectionWrapper";
import {projectService} from "@/services/projects.service";
import {Slider} from "@/ui/slider/Slider";
import {ReactNode} from "react";
import {ProjectItem} from "@/app/(public)/projects/ProjectItem";


export const ProjectsWidget = async () => {
    const {data} = await projectService.getProjects();

    const items = (): ReactNode[] => {
        return data.data.map(item => (
            <ProjectItem item={item} key={item.id}/>
        ))
    }

    return (
        <SectionWrapper className={cx([
            '',
            'sm:gap-35',
            'md:gap-40',
            'lg:gap-45',
            'xl:'
        ])}>
            <MainSubHeader text={'Реализованные проекты'}/>

            <div className={cx([
                'flex flex-col max-w-full',
                'sm:',
                'md:',
                'lg:',
                'xl:'
            ])}>
                <p className={cx([
                    'text-10',
                    'sm:text-14 sm:w-3/4',
                    'md:text-16',
                    'lg:text-16',
                    'xl:'
                ])}>
                    Наша компания имеет глубокий опыт работы с множеством крупных и значимых объектов. От роскошных
                    апартаментов и отелей до медицинских центров и государственных учреждений.
                </p>

                <Slider items={items()}/>
            </div>

            <div className={'self-start'}>
                <LinkBtm
                    item={PAGES.PROJECTS}
                    text={'Ознакомиться'}
                />
            </div>
        </SectionWrapper>
    );
};