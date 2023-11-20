import {useEffect, useMemo} from "react";
import {Button} from "react-bootstrap";

import {AppDropdown} from "@shared/ui";
import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser} from "@shared/hooks";

import {fetchEqFilters} from "../../model/api/fetchEqFilters";
import {getEqProjects, getEqViewMode} from "../../model/selectors/filterSelectors";

export const EqFilters = () => {
    const {queryParameters, setQueryParam} = useAppQuery();
    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
    const viewModes = useAppSelector(getEqViewMode);
    const projects = useAppSelector(getEqProjects);

    const viewModesList = useMemo(() => {
        return viewModes?.filters.map((viewMode) => viewMode.name) || []
    }, [viewModes?.filters])

    useEffect(() => {
        if (currentUser.current_department) {
            dispatch(fetchEqFilters({
                department_number: currentUser.current_department.number,
                ...queryParameters,
            }))
        }
        //eslint-disable-next-line
    }, [dispatch, currentUser.current_department, queryParameters.project_mode])

    const viewModeClb = (item: string) => {
        const targetKey = viewModes?.filters.find(viewMode => viewMode.name === item)?.key
        if (targetKey) {
            targetKey === viewModes?.default.key ?
                setQueryParam('view_mode', '')
                :
                setQueryParam('view_mode', String(targetKey))
        }
    }

    const getSelectedViewMode = () => {
        if (queryParameters.view_mode && viewModes) {
            const viewMode = viewModes.filters.find(viewMode => viewMode.key === queryParameters.view_mode)?.name;
            if (viewMode) {
                return viewMode;
            } else {
                setQueryParam('view_mode', '');
                return viewModes.default.name;
            }
        } else if (viewModes) {
            return viewModes.default.name;
        } else {
            return 'Загрузка';
        }
    }

    const getSelectedProject = () => {
        if (queryParameters.project && projects) {
            const project = projects.filters.find(project => project === queryParameters.project);
            if (project) {
                return project;
            } else {
                setQueryParam('project', '');
                return projects.default;
            }
        } else if (projects) {
            return projects.default;
        } else {
            return 'Загрузка';
        }
    }

    const projectClb = (item: string) => {
        item === projects?.default ?
            setQueryParam('project', '')
            :
            setQueryParam('project', item)
    }

    return (
        <>
            <AppDropdown
                selected={getSelectedViewMode()}
                active={!!queryParameters.view_mode}
                items={viewModesList}
                onSelect={viewModeClb}
            />

            <AppDropdown
                selected={getSelectedProject()}
                active={!!queryParameters.project}
                items={projects?.filters}
                onSelect={projectClb}
                childrenPos={'bottom'}
            >
                <Button className={"w-100 p-0 mt-3"}
                        style={{height: "25px"}}
                        variant={'secondary'}
                        onClick={() => setQueryParam(
                            'project_mode',
                            queryParameters.project_mode ? '' : 'all'
                        )}
                >
                    {queryParameters.project_mode ? "Актуальные" : "Показать все"}
                </Button>
            </AppDropdown>
        </>
    );
};
