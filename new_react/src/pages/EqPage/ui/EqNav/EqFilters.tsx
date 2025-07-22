import React, {useEffect} from 'react';

import {APP_PERM} from '@shared/consts';
import {useAppDispatch, useAppQuery, useCurrentUser, usePermission} from '@shared/hooks';

import {fetchEqFilters} from '../../model/api/fetchEqFilters';
import {EqViewMode} from './EqViewMode';
import {EqProjectFilter} from "./EqProjectFilter";
import {eqPageActions} from "@pages/EqPage";

export const EqFilters = () => {
    const {queryParameters, initialLoad} = useAppQuery();
    const dispatch = useAppDispatch();
    const {currentUser} = useCurrentUser();

    const bossPerm = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);

    useEffect(() => {
        if (currentUser.current_department?.number && !initialLoad) {
            dispatch(fetchEqFilters({
                department_id: currentUser.current_department.id,
                project_mode: queryParameters.project_mode,
            }));
        }
        if (!bossPerm) {
            dispatch(eqPageActions.viewModeInited());
        }
        // eslint-disable-next-line
    }, [bossPerm, currentUser.current_department?.number, dispatch, initialLoad, queryParameters.project_mode]);


    return (
        <>
            {bossPerm &&
                <EqViewMode/>
            }
            <EqProjectFilter/>
        </>
    );
};
