import {AppNavbar} from "@widgets/AppNavbar";
import React, {useEffect, useMemo, useState} from "react";
import {useAppQuery, useDebounce} from "@shared/hooks";
import {AppDropdown, AppInput} from "@shared/ui";

import {useProjectsList} from "../model/api/rtk";
import {Button} from "react-bootstrap";

export const OrderPageNav = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    const {data} = useProjectsList({mode: 'active'});
    const {setQueryParam, queryParameters} = useAppQuery();

    const [orderNumberInput, setOrderNumberInput] = useState<string>(queryParameters.number || '');

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    );

    useEffect(() => {
        debouncedSetQueryParam('number', orderNumberInput)
        // eslint-disable-next-line
    }, [orderNumberInput]);


    const allProjects: string = 'Все проекты';
    const [currentProject, setCurrentProject] = useState<string>(
        queryParameters.project || allProjects
    );
    const setProjectClb = (project: string) => {
        setCurrentProject(project);
        if (project !== allProjects) {
            setQueryParam('project', project)
        } else {
            setQueryParam('project', '')
        }
    };

    const projects = useMemo(() => {
        if (data) {
            return [...data.data];
        } else {
            return [allProjects];
        }
    }, [data]);

    type statusTypes = "Все заказы" | "В работе" | "Завершен"
    const statuses: statusTypes[] = ["Все заказы", "В работе", "Завершен"];
    const setStatus = (status: string) => {
        if (status === "Все заказы") {
            setQueryParam("status", "")
        } else if (status === "В работе") {
            setQueryParam("status", "0")
        } else {
            setQueryParam("status", "1")
        }
    }

    const getCurrentStatus = useMemo(() => {
        if (queryParameters.status === "0") {
            return "В работе";
        } else if (queryParameters.status === "1") {
            return "Завершен";
        } else {
            return "Все заказы";
        }
        //eslint-disable-next-line
    }, [queryParameters.status])

    return (
        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
            <AppInput placeholder={'Номер заказа'}
                      className={'my-auto ms-3'}
                      onChange={(event) => setOrderNumberInput(event.target.value)}
                      value={orderNumberInput}
            />

            <AppDropdown
                selected={currentProject}
                active={currentProject !== allProjects}
                items={projects}
                onSelect={setProjectClb}
            />

            <AppDropdown
                selected={getCurrentStatus}
                active={!!queryParameters.status}
                items={statuses}
                childrenPos={'bottom'}
                onSelect={setStatus}
            >
                <Button className={'w-100 p-0 mt-3'}
                        style={{height: '25px'}}
                        variant={'secondary'}
                        onClick={() => setQueryParam('project_mode', queryParameters.project_mode ? '' : 'all')}
                >
                    {queryParameters.project_mode ? 'Актуальные' : 'Показать все'}
                </Button>
            </AppDropdown>
        </AppNavbar>
    );
};
