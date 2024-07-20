import React, {useEffect, useMemo, useState} from "react";
import {useAppQuery, useDebounce} from "@shared/hooks";
import {AppDropdown, AppInput} from "@shared/ui";
import {useProjectsList} from "@pages/OrdersPage/model/api/rtk";
import {Button} from "react-bootstrap";

export const ProductNavContent = () => {
    const {setQueryParam, queryParameters} = useAppQuery();
    const [productNameInput, setProductNameInput] = useState<string>(queryParameters.name || '');

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );

    useEffect(() => {
        debouncedSetQueryParam('name', productNameInput)
        // eslint-disable-next-line
    }, [productNameInput]);

    const allProjects: string = 'Все проекты';
    const [currentProject, setCurrentProject] = useState<string>(
        queryParameters.project || allProjects
    );
    const {data} = useProjectsList({mode: queryParameters.project_mode === 'all' ? 'all' : 'active'});

    const projects = useMemo(() => {
        if (data) {
            return [...data.data];
        } else {
            return [allProjects];
        }
    }, [data]);

    const setProjectClb = (project: string) => {
        setCurrentProject(project);
        if (project !== allProjects) {
            setQueryParam('project', project)
        } else {
            setQueryParam('project', '')
        }
    };

    return (
        <>
            <AppInput placeholder={'Наименование товара'}
                      className={'my-auto ms-3'}
                      onChange={(event) => setProductNameInput(event.target.value)}
                      value={productNameInput}
            />

            <AppDropdown
                selected={currentProject}
                active={currentProject !== allProjects}
                items={projects}
                childrenPos={'bottom'}
                onSelect={setProjectClb}
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
