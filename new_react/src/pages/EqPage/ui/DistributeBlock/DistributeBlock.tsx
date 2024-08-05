import React, {useEffect, useMemo} from "react";
import {useAppSelector, useCurrentUser, useQueryParams} from "@shared/hooks";
import {eqFiltersReady, getEqViewMode} from "@pages/EqPage/model/selectors/filterSelectors";
import {EqCardList} from "@widgets/EqCardList";


interface DistributeBlockProps {
    deps: any[];
    noRelevantIds: number[];
}


export const DistributeBlock = (props: DistributeBlockProps) => {
    const {noRelevantIds, deps} = props;
    const {currentUser} = useCurrentUser();
    const filters = useAppSelector(getEqViewMode);
    const {queryParameters, setQueryParam} = useQueryParams();
    const filtersReady = useAppSelector(eqFiltersReady);

    const users = useMemo(() => {
        return (filters?.filters
                .filter(item => !isNaN(Number(item.key)))
                .filter(item => item.key !== currentUser.id))
            || [];
    }, [currentUser.id, filters?.filters]);

    useEffect(() => {
        if (users.length > 0 && filtersReady) {
            if (queryParameters.selected_user === undefined ||
                !users.map(item => item.key).includes(queryParameters.selected_user)
            ) {
                setQueryParam('selected_user', String(users[0].key))
            }
        }
    }, [queryParameters.selected_user, setQueryParam, users, currentUser.current_department, filtersReady]);

    const selectUserClb = (userKey: string) => {
        setQueryParam('selected_user', userKey)
    }

    return (
        <div
            style={{
                height: `100%`,
                maxHeight: `100%`,
                overflowX: 'hidden',
                overflowY: 'auto',
                position: "relative",
                padding: '.15rem 0 0 .15rem'
            }}
        >
            {users?.map(user => (
                <div
                    style={{
                        padding: "0 0 .15rem 0",
                        margin: "0 .15rem 0 0",
                        position: "relative",
                    }}
                    key={user.key}
                >
                    <div
                        style={{overflowY: "hidden"}}
                        className={`p-2 text-nowrap d-flex gap-2
                        ${queryParameters.selected_user === user.key ? " bg-warning " : " bg-light "}
                         border border-black border-2 rounded align-items-center`}
                        onClick={() => selectUserClb(String(user.key))}
                    >
                        <button
                            className={'appBtn yellowBtn px-1 rounded'}
                        >
                            Выбрать
                        </button>
                        {user.name}
                    </div>
                    <EqCardList
                        listType={"distribute"}
                        deps={deps}
                        inited={filtersReady || false}
                        noRelevantIds={noRelevantIds}
                        extraParams={{
                            view_mode: String(user.key),
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
