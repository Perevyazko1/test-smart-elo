import React, {useEffect, useState} from "react";

import {AppDropdown} from "@shared/ui";
import {useAppDispatch, useAppQuery, useAppSelector} from "@shared/hooks";

import {fetchProjects} from "../../model/service/fetchProjects";
import {getProjects} from "../../model/selectors";

export const ProjectDropdown = () => {
    const {setQueryParam, queryParameters} = useAppQuery();
    const dispatch = useAppDispatch();
    const projects = useAppSelector(getProjects);

    const allProjects: string = 'Все проекты';

    const [currentProject, setCurrentProject] = useState<string>(
        queryParameters.project || allProjects
    );
    
    useEffect(() => {
        dispatch(fetchProjects({mode: "all"}))
    }, [dispatch])

    const setProjectClb = (project: string) => {
        setCurrentProject(project);
        if (project !== allProjects) {
            setQueryParam('project', project)
        } else {
            setQueryParam('project', '')
        }
    };

    return (
        <AppDropdown
            selected={currentProject}
            active={currentProject !== allProjects}
            items={projects}
            onSelect={setProjectClb}
        />
    );
};
