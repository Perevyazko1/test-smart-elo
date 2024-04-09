import React, {useEffect, useMemo} from 'react';
import {Button} from 'react-bootstrap';

import {eqPageActions} from "@pages/EqPage";

import {APP_PERM} from '@shared/consts';
import {AppDropdown} from '@shared/ui';
import {useAppDispatch, useAppQuery, useAppSelector, useCurrentUser, usePermission} from '@shared/hooks';

import {fetchEqFilters} from '../../model/api/fetchEqFilters';
import {eqFiltersInited, getEqProjects, getEqViewMode} from '../../model/selectors/filterSelectors';

export const EqFilters = () => {
    const {queryParameters, setQueryParam, initialLoad} = useAppQuery();
    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();
    const viewModes = useAppSelector(getEqViewMode);
    const projects = useAppSelector(getEqProjects);
    const inited = useAppSelector(eqFiltersInited);

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
        if (currentUser.current_department.number && !initialLoad) {
            if (!bossPerm) {
                setQueryParam('view_mode', '');
            }
            dispatch(fetchEqFilters({
                department_id: currentUser.current_department.id,
                mode: queryParameters.mode,
            }));
        }
        // eslint-disable-next-line
    }, [bossPerm, currentUser.current_department.number, dispatch, initialLoad, queryParameters.mode]);

    useEffect(() => {
        let edited = false;
        if (inited && !initialLoad) {
            // Проверяем закончилась ли инициализация квери параметров
            // Затем проверяем есть ли у нас установленный режим просмотра
            if (queryParameters.view_mode) {
                // Проверяем прошла ли первоначальная загрузка фильтров
                // Проверяем, есть ли режим просмотра в текущих загруженных фильтрах
                const checkViewMode = viewModes?.filters.find(
                    viewMode => viewMode.key === queryParameters.view_mode
                );
                // Если его нет - обнуляем установленный режим просмотра
                if (!checkViewMode?.name) {
                    setQueryParam('view_mode', '');
                    edited = true;
                }
            }
            if (queryParameters.project) {
                const checkProject = projects?.filters.find(
                    project => project === queryParameters.project
                );
                if (!checkProject) {
                    setQueryParam('project', '');
                    edited = true;
                }
            }

            if (!edited) {
                dispatch(eqPageActions.filtersReady(true));
            }
        }
    }, [
        dispatch,
        inited,
        initialLoad,
        projects?.filters,
        queryParameters.project,
        queryParameters.view_mode,
        setQueryParam,
        viewModes?.filters
    ]);

    const updTargetItemsBeforeSetViewMode = (prevViewMode: string, newViewMode: string) => {
        if (['unfinished', 'boss'].includes(prevViewMode) || ['unfinished', 'boss'].includes(newViewMode)) {
            dispatch(eqPageActions.awaitUpdated());
        }
        dispatch(eqPageActions.inWorkUpdated());
        dispatch(eqPageActions.readyUpdated());
    }

    const viewModeClb = (item: string) => {
        const newState = viewModes?.filters.find(viewMode => viewMode.name === item)?.key;
        const prevState = queryParameters.view_mode;
        if (newState) {
            setQueryParam('view_mode', newState === viewModes.default.key ? '' : String(newState));
        }
        updTargetItemsBeforeSetViewMode(prevState, String(newState))
    };

    const getSelectedViewMode = viewModes ?
        (queryParameters.view_mode
            && viewModes.filters.find(viewMode => viewMode.key === queryParameters.view_mode)?.name
        ) || viewModes.default.name : 'Загрузка';

    const getSelectedProject = projects ?
        (queryParameters.project && projects.filters.find(project => project === queryParameters.project)
        ) || projects.default : 'Загрузка';

    const projectClb = (item: string) => {
        setQueryParam('project', item === projects?.default ? '' : item);
        dispatch(eqPageActions.awaitUpdated());
        dispatch(eqPageActions.inWorkUpdated());
        dispatch(eqPageActions.readyUpdated());
    };


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
