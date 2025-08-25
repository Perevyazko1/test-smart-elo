import React from "react";
import {AppSelect, AppTooltip} from "@shared/ui";
import {useAppDispatch, useAppQuery, useAppSelector, useStorageString} from "@shared/hooks";
import {getEqProjects} from "@pages/EqPage/model/selectors/filterSelectors";
import {eqPageActions} from "@pages/EqPage";


export const EqProjectFilter = () => {
    const {queryParameters, setQueryParam} = useAppQuery();
    const projects = useAppSelector(getEqProjects);
    const dispatch = useAppDispatch();

    const QUERY_KEY = "project";
    const {inited, setValue} = useStorageString({
        key: `EQ_${QUERY_KEY}`,
        onChangeCallback: (mode) => {
            const newState = projects?.filters.find(proj => proj === mode);
            if (newState) {
                setQueryParam(QUERY_KEY, newState === projects.default ? '' : newState);
            } else {
                setQueryParam(QUERY_KEY, '');
            }
            dispatch(eqPageActions.projectsInited());
        },
        defaultValue: "",
        storageType: "localStorage",
    });

    const selectedProject = projects ?
        (queryParameters.project && projects.filters.find(project => project === queryParameters.project)
        ) || projects.default : 'Загрузка';


    return (
        <AppTooltip title="Отфильтровать наряды по принадлежности к проекту заказа">
            <AppSelect
                label={'Проект'}
                variant={'dropdown'}
                style={{width: 155}}
                isLoading={!inited}
                value={selectedProject}
                colorScheme={'darkInput'}
                options={projects?.filters}
                onSelect={setValue}
            >
                <button
                    className={'appBtn blackBtn w-100 p-0 mt-1 mb-3'}
                    style={{height: '25px'}}
                    onClick={() => setQueryParam('project_mode', queryParameters.project_mode ? '' : 'all')}
                >
                    {queryParameters.project_mode ? 'Актуальные' : 'Показать все'}
                </button>
            </AppSelect>
        </AppTooltip>
    );
};