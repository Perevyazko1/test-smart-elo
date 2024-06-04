import {rtkAPI} from "@shared/api";


interface ProjectsList {
    data: string[];
}

interface ProjectsListApiProps {
    mode: 'all' | 'active';
}


const ProjectsListApi = rtkAPI.injectEndpoints({
            endpoints: (build) => ({
                getProjects: build.query<ProjectsList, ProjectsListApiProps>({
                    query: (props: ProjectsListApiProps) => ({
                        url: '/core/get_project_filters',
                        params: {
                            mode: props.mode,
                        }
                    }),
                }),
            }),
        }
    )
;

export const useProjectsList = ProjectsListApi.useGetProjectsQuery;
