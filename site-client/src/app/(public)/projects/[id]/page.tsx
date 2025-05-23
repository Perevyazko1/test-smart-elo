import Image from "next/image";

import {PageIdProp} from "@/types/page.types";
import {projectService} from "@/services/projects.service";
import {PageContainer} from "@/ui/containers/PageContainer";
import {cx} from "@/utils/class-builder";
import {PageHeader} from "@/ui/headers/PageHeader";
import {SERVER_URL} from "@/constants/constants";
import {ShowAllBtn} from "@/components/widgets/ShowAllBtn";
import {PAGES} from "@/config/public-page.config";


const PageDetails = async ({params}: PageIdProp) => {
    const pars = await params;

    if (!pars) {
        return null;
    }
    const id = pars.id;

    const data = await projectService.getProject(id);
    const images = await projectService.getProjectImages(id);

    return (
        <PageContainer>
            <PageHeader title={data.data.name}/>

            <section className={cx([
                'flex flex-col gap-25',
                'sm:gap-35',
                'md:gap-35',
                'lg:gap-60',
                'xl:'
            ])}>
                <p className={cx([
                    'text-10',
                    'sm:text-12',
                    'md:text-14',
                    'lg:text-18',
                    'xl:'
                ])}>
                    {data.data.about}
                </p>

                <div className={cx([
                    'flex flex-row flex-wrap gap-8',
                    'sm:gap-11',
                    'md:gap-13',
                    'lg:gap-20',
                    'xl:'
                ])}>
                    {images.data.data.map(image => (
                        <Image
                            key={image.id}
                            src={`${SERVER_URL}${image.image_url}`}
                            alt={`${data.data.name} ${image.sort_order}`}
                            height={580}
                            width={908}
                            className={cx([
                                'relative h-[225px] flex-1 object-cover',
                                'sm:h-[309px]',
                                'md:h-[357px]',
                                'lg:h-[580px]',
                                'xl:'
                            ])}
                        />
                    ))}
                </div>

                <ShowAllBtn text={"Другие проекты"} link={PAGES.PROJECTS}/>

            </section>
        </PageContainer>
    );
};

export default PageDetails;
