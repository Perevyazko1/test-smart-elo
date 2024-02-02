import {Ordering, RetarifficationCard} from "../types/types";
import {rtkAPI} from "@shared/api";

interface ProjectsList {
    data: string[];
}

interface RetarifficationProps {
    product__id: number;
    department__number: number;
    ordering: Ordering;
}

interface PostRetarifficationProps {
    ids: number[];
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
                getRetarifficationList: build.query<RetarifficationCard[], RetarifficationProps>({
                    query: (props: RetarifficationProps) => ({
                        url: '/core/retariffication',
                        params: {
                            product__id: props.product__id,
                            department__number: props.department__number,
                            ...(props.ordering !== null && {ordering: props.ordering}),
                        },
                    }),
                    providesTags: (result) => [{ type: 'RetarifficationCard', id: 'ALL' }],
                }),
                postRetariffication: build.mutation<void, PostRetarifficationProps>({
                    query: (props: PostRetarifficationProps) => ({
                        url: '/core/post_retariffication/',
                        method: 'POST',
                        body: {ids: props.ids},
                    }),
                    invalidatesTags: [{ type: 'RetarifficationCard', id: 'ALL' }],
                }),
            }),
        }
    )
;

export const useProjectsList = ProjectsListApi.useGetProjectsQuery;
export const useRetarifficationList = ProjectsListApi.useGetRetarifficationListQuery;
export const usePostRetariffication = ProjectsListApi.usePostRetarifficationMutation;
