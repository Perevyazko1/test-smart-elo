import React, {useEffect, useMemo} from 'react';

import {eqPageActions} from "@pages/EqPage";

import {APP_PERM} from '@shared/consts';
import {AppSelect} from '@shared/ui';
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
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const viewModesList = useMemo(() => {
        let result = viewModes?.filters;
        if (!bossPerm) {
            result = result?.filter(mode => mode.name !== 'Режим бригадира');
        }
        if (!behalfPerm) {
            result = result?.filter(mode => ['self', 'boss', 'unfinished', 'distribute'].includes(String(mode.key)));
        }
        if (isViewer) {
            result = result?.filter(mode => mode.name !== 'Личные наряды');
        }
        return result?.map(viewMode => viewMode.name) || [];
    }, [behalfPerm, bossPerm, isViewer, viewModes?.filters]);

    useEffect(() => {
        if (currentUser.current_department?.number && !initialLoad) {
            if (!bossPerm) {
                setQueryParam('view_mode', '');
            }
            dispatch(fetchEqFilters({
                department_id: currentUser.current_department.id,
                project_mode: queryParameters.project_mode,
            }));
        }
        // eslint-disable-next-line
    }, [bossPerm, currentUser.current_department?.number, dispatch, initialLoad, queryParameters.project_mode]);

    useEffect(() => {
        let edited = false;
        if (inited && !initialLoad) {
            // Проверяем закончилась ли инициализация квери параметров.
            // Проверяем, находится ли пользователь в режиме просмотра.
            // Если включен режим просмотра - то устанавливаем режим бригадира.
            if (isViewer) {
                const checkViewMode = viewModes?.filters.find(
                    viewMode => viewMode.key === queryParameters.view_mode
                );
                // Если его нет - обнуляем установленный режим просмотра
                if (!checkViewMode?.name) {
                    setQueryParam('view_mode', 'boss');
                    edited = true;
                }
            }
            // Если пользователь не в режиме просмотра проверяем есть ли у нас установленный режим просмотра
            else if (queryParameters.view_mode) {
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
        isViewer,
        dispatch,
        inited,
        initialLoad,
        projects?.filters,
        queryParameters.project,
        queryParameters.view_mode,
        setQueryParam,
        viewModes?.filters
    ]);
    const viewModeClb = (item: string) => {
        const newState = viewModes?.filters.find(viewMode => viewMode.name === item)?.key;
        if (newState) {
            setQueryParam('view_mode', newState === viewModes.default.key ? '' : String(newState));
        }
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
    };


    return (
        <>
            {bossPerm &&
                <AppSelect
                    noInput
                    variant={'dropdown'}
                    style={{width: 170}}
                    label={'Режим просмотра'}
                    colorScheme={'darkInput'}
                    value={getSelectedViewMode}
                    options={viewModesList}
                    onSelect={viewModeClb}
                />
            }
            <AppSelect
                label={'Проект'}
                variant={'dropdown'}
                style={{width: 170}}
                isLoading={!inited}
                value={getSelectedProject}
                colorScheme={'darkInput'}
                options={projects?.filters}
                onSelect={projectClb}
            >
                <button
                    className={'appBtn blackBtn w-100 p-0 mt-1 mb-3'}
                    style={{height: '25px'}}
                    onClick={() => setQueryParam('project_mode', queryParameters.project_mode ? '' : 'all')}
                >
                    {queryParameters.project_mode ? 'Актуальные' : 'Показать все'}
                </button>
            </AppSelect>
        </>
    );
};
