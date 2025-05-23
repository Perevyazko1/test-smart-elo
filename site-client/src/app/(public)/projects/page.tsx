import {PageContainer} from "@/ui/containers/PageContainer";
import {projectService} from "@/services/projects.service";
import {cx} from "@/utils/class-builder";
import {PageHeader} from "@/ui/headers/PageHeader";
import {ProjectItem} from "@/app/(public)/projects/ProjectItem";


const ProjectsPage = async () => {
    const {data} = await projectService.getProjects()

    return (
        <PageContainer>
            <PageHeader title={"Реализованные проекты"}/>

            <section className={cx([
                'grid grid-cols-1 gap-25',
                'sm:gap-14 sm:grid-cols-2',
                'md:gap-15 md:grid-cols-3',
                'lg:gap-18 lg:grid-cols-4',
                'xl:'
            ])}>
                {data.data.map(project => (
                    <ProjectItem item={project} key={project.id} showAbout/>
                ))}
            </section>
        </PageContainer>
    );
};

export default ProjectsPage;