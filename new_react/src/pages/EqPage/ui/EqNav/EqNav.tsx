import {AppNavbar} from "@widgets/AppNavbar";
import {useCurrentUser, useDebounce, usePermission, useQueryParams, useStorageString} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {AppInput, AppSwitch, AppTooltip} from "@shared/ui";

import {EqSeriesSize} from "./EqSeriesSize";
import {EqDepWidget} from "./EqDepWidget";
import {EqFilters} from "./EqFilters";
import React, {useEffect, useState} from "react";


export const EqNav = () => {
    const {queryParameters, setQueryParam} = useQueryParams();
    const {currentUser} = useCurrentUser();
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);
    const [searchValue, setSearchValue] = useState(queryParameters.search);

    const QUERY_INPUT_KEY = "search";
    const {inited: inputInited, setValue: setInputValue} = useStorageString({
        key: QUERY_INPUT_KEY,
        onChangeCallback: (value) => setSearchValue(value || ""),
        defaultValue: "",
        storageType: "sessionStorage",
    });

    const seriesSizeClb = (item: string) => {
        setQueryParam('series_size', item)
    }

    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        800
    );

    useEffect(() => {
        debouncedSetQueryParam('search', searchValue)
        //eslint-disable-next-line
    }, [searchValue]);

    const QUERY_KEY = "pro";

    const {inited, setValue} = useStorageString({
        key: QUERY_KEY,
        onChangeCallback: (mode) => setQueryParam(QUERY_KEY, mode || ""),
        defaultValue: "",
        storageType: "localStorage",
    });

    const proModeSwitch = () => {
        if (queryParameters.pro) {
            setValue('');
        } else {
            setValue('true');
        }
    };

    return (
        <AppNavbar>
            <AppTooltip title={'Выбор отдела, наряды которого будут отображены в блоках'}>
                <EqDepWidget/>
            </AppTooltip>

            <EqFilters/>

            {!currentUser.current_department_details?.single && !isViewer &&

                <AppTooltip title={'Количество нарядов для одновременного изменения'}>
                    <EqSeriesSize queryParameters={queryParameters} clb={seriesSizeClb}/>
                </AppTooltip>
            }

            <div className={'d-flex align-items-end align-self-stretch'}>
                <AppTooltip title="Расширенный режим">
                    <AppSwitch
                        style={{transform: "scale(0.8) translate(0, 3px)", fontSize: '10px'}}
                        checked={!!queryParameters.pro}
                        onSwitch={proModeSwitch}
                        disabled={!inited}
                        labelPosition={'labelBottom'}
                        handleContent={'⚙️'}
                        label={"НАСТР"}
                    />
                </AppTooltip>
            </div>

            <AppTooltip title="Отфильтровать карточки по названию изделия или номеру заказа">
                <AppInput placeholder={'Поиск'}
                          style={{width: "125px", fontSize: '10px'}}
                          className={'mx-2'}
                          disabled={!inputInited}
                          onChange={(event) => setInputValue(event.target.value)}
                          value={searchValue || ""}
                />
            </AppTooltip>

        </AppNavbar>
    );
};
