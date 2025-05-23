import {cx} from "@/utils/class-builder";
import Link from "next/link";
import {PAGES} from "@/config/public-page.config";
import Image from "next/image";
import {SERVER_URL} from "@/constants/constants";
import { Project } from "@/types/project.types";


interface ProjectItemProps {
    item: Project;
    showAbout?: boolean;
}


export const ProjectItem = (props: ProjectItemProps) => {
    const {item, showAbout = false} = props;

    return (
        <div
            className={cx([
                'min-w-[134px] w-full',
                'sm:min-w-[236px]',
                'md:min-w-[367px]',
                'lg:min-w-[446px]',
                'xl:',
                'snap-start',
            ])}
        >
            <Link href={{
                pathname: `${PAGES.PROJECTS.link}/${item.id}`
            }}>
                <Image
                    width={446}
                    height={580}
                    // TODO make alternative image
                    src={`${SERVER_URL}${item.preview_image?.image_url || ""}`}
                    alt={item.name}
                    className={cx([
                        'w-full object-cover h-[186px] mb-15 max-h-[40dvh]',
                        'sm:h-[326px] sm:max-h-[40dvh] sm:mb-20',
                        'md:h-[478px] md:max-h-[40dvh] md:mb-20',
                        'lg:h-[580px] lg:max-h-[40dvh] lg:mb-35',
                        'xl:'
                    ])}
                />
            </Link>

            <Link href={{
                pathname: `${PAGES.PROJECTS.link}/${item.id}`
            }}>
                <span className={cx([
                    'text-12 line-clamp-2',
                    'sm:text-16',
                    'md:text-18',
                    'lg:text-22',
                    'xl:'
                ])}>
                    {item.name}
                </span>
            </Link>

            {showAbout && (
                <Link href={{
                pathname: `${PAGES.PROJECTS.link}/${item.id}`
            }}>
                <span className={cx([
                    'text-10 line-clamp-1 mt-12',
                    'sm:text-14 sm:mt-15',
                    'md:text-14 md:mt-20',
                    'lg:text-16 lg:mt-25',
                    'xl:'
                ])}>
                    {item.about}
                </span>
            </Link>
            )}
        </div>
    );
};