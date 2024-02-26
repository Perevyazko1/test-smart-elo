import React, {useEffect, useMemo} from 'react';
import {Button} from 'react-bootstrap';

import {APP_PERM} from '@shared/consts';
import {AppDropdown} from '@shared/ui';
import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser, usePermission} from '@shared/hooks';

import {fetchEqFilters} from '../../model/api/fetchEqFilters';
import {getEqProjects, getEqViewMode} from '../../model/selectors/filterSelectors';

export const EqFilters = () => {
    const {queryParameters, setQueryParam, initialLoad} = useAppQuery();
    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
    const viewModes = useAppSelector(getEqViewMode);
    const projects = useAppSelector(getEqProjects);

    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);
    const behalfPerm = usePermission(APP_PERM.BEHALF_ACTIONS);

    const viewModesList = useMemo(() => {
        let result = viewModes?.filters;
        if (!bossPerm) {
            result = result?.filter(mode => mode.name !== 'Режим бригадира');
        }
        if (!behalfPerm) {
            result = result?.filter(mode => ['self', 'boss', 'unfinished'].includes(String(mode.key)));
        }
        return result?.map(viewMode => viewMode.name) || [];
    }, [behalfPerm, bossPerm, viewModes?.filters]);

    useEffect(() => {
        if (currentUser.current_department && !initialLoad) {
            if (!bossPerm) {
                setQueryParam('view_mode', '');
            }
            console.log('Пошел запрос фильтров')
            dispatch(fetchEqFilters({
                department_number: currentUser.current_department.number,
                ...queryParameters,
            }));
        }
        // eslint-disable-next-line
    }, [dispatch, currentUser.current_department, queryParameters, initialLoad]);

    const viewModeClb = (item: string) => {
        const targetKey = viewModes?.filters.find(viewMode => viewMode.name === item)?.key;
        if (targetKey) {
            setQueryParam('view_mode', targetKey === viewModes.default.key ? '' : String(targetKey));
        }
    };

    const getSelectedViewMode = useMemo(() => {
        if (queryParameters.view_mode && viewModes) {
            const selectedViewMode = viewModes.filters.find(viewMode => viewMode.key === queryParameters.view_mode);
            if (!selectedViewMode) {
                setQueryParam('view_mode', '')
                return viewModes.default.name;
            }
            return selectedViewMode.name;
        } else {
            return viewModes ? viewModes.default.name : 'Загрузка';
        }
    }, [queryParameters.view_mode, setQueryParam, viewModes])

    const projectClb = (item: string) => {
        setQueryParam('project', item === projects?.default ? '' : item);
    };

    const getSelectedProject = useMemo(() => {
        if (queryParameters.project && projects) {
            const selectedProject = projects.filters.find(project => project === queryParameters.project);
            
            if (!selectedProject) {
                setQueryParam('project', '');
                return projects.default; 
            }
            return selectedProject;
        } else {
            return projects ? projects.default : 'Загрузка';
        }
    }, [projects, queryParameters.project, setQueryParam])

    return (
        <>
            {bossPerm &&
                <AppDropdown
                    selected={getSelectedViewMode}
                    active={!!queryParameters.view_mode}
                    items={viewModesList}
                    onSelect={viewModeClb}
                />
            }
            <AppDropdown
                selected={getSelectedProject}
                active={!!queryParameters.project}
                items={projects?.filters}
                onSelect={projectClb}
                childrenPos={'bottom'}
            >
                <Button className={'w-100 p-0 mt-3'}
                        style={{height: '25px'}}
                        variant={'secondary'}
                        onClick={() => setQueryParam('project_mode', queryParameters.project_mode ? '' : 'all')}
                >
                    {queryParameters.project_mode ? 'Актуальные' : 'Показать все'}
                </Button>
            </AppDropdown>
        </>
    );
};
