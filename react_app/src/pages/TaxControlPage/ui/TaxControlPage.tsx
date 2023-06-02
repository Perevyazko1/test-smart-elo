import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {Container, OverlayTrigger, Spinner, Tooltip} from "react-bootstrap";

import {getEmployeePinCode} from "entities/Employee";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {fetchTaxControlList} from "../model/service/fetchTaxControlData/fetchTaxControlData";
import {taxControlReducer} from "../model/slice/taxControlPageSlice";
import {getTaxControlData} from "../model/selectors/getTaxControlData/getTaxControlData";
import {TaxControlTable} from "./TaxControlTable/TaxControlTable";
import {getTaxControlUpdated} from "../model/selectors/getTaxControlUpdated/getTaxControlUpdated";
import {TCNavBar} from "./TCNavBar/TCNavBar";
import {fetchTCFilters} from "../model/service/fetchTaxControlFilters/fetchTCFilters";
import {getTCCurrentViewMode} from "../model/selectors/getTCCurrentViewMode/getTCCurrentViewMode";
import {getTCDepartmentFilter} from "../model/selectors/getTCDepartmentFilter/getTCDepartmentFilter";
import {getTCProductNameFilter} from "../model/selectors/getTCProductNameFilter/getTCProductNameFilter";
import {getTCIsLoading} from "../model/selectors/getTCIsLoading/getTCIsLoading";
import {PageWithPagination} from "../../../shared/ui/PageWithPagination/PageWithPagination";
import {Skeleton} from "../../../shared/ui/Skeleton/Skeleton";
import {fetchNextTaxControlData} from "../model/service/fetchNextTaxControlData/fetchNextTaxControlData";


const initialReducers: ReducersList = {
    taxControl: taxControlReducer,
}

const TaxControlPage = memo(() => {
    const dispatch = useAppDispatch()
    const tax_control_data = useSelector(getTaxControlData)
    const page_is_loading = useSelector(getTCIsLoading)
    const page_updated = useSelector(getTaxControlUpdated)

    useEffect(() => {
        dispatch(fetchTCFilters({}))
    }, [dispatch])


    useEffect(() => {
        if (tax_control_data?.updated !== undefined)
            dispatch(fetchTaxControlList({
                limit: 10,
                offset: 0,
            }))
        // eslint-disable-next-line
    }, [dispatch, page_updated])

    const fetchNextData = () => {
        if (tax_control_data?.data?.next) {
            dispatch(fetchNextTaxControlData({next: tax_control_data.data.next}))
        }
    }

    const skeleton = (
        <Skeleton width={"100%"}
                  height={"100px"}
                  pagination_size={3}
                  className={'mb-1'}
                  rounded={false}
                  scaled={true}
        />
    )

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <TCNavBar/>

            <section style={{height: "93vh", background: "#929292"}} className={'p-2'}>
                <PageWithPagination
                    className={'bg-light bg-gradient p-2 rounded h-100 mx-3'}
                    style={{overflow: "auto", overflowX: "hidden", overflowY: "auto"}}
                    hasMore={!!tax_control_data?.data?.next}
                    scroll_callback={fetchNextData}
                    skeleton={skeleton}
                >
                    <div className={'fs-3 d-flex justify-content-start align-items-center'}>
                        Страница назначения тарификаций

                        <OverlayTrigger
                            overlay={<Tooltip id="tooltip-disabled">
                                После назначения тарификации указанный тариф будет применен ко всем ранее не
                                тарифицированным и всем будущим нарядам.
                            </Tooltip>}
                            placement={'bottom'}
                        >
                            <i className="far fa-question-circle mx-2 mt-2 fs-5 align-self-stretch"/>
                        </OverlayTrigger>

                    </div>

                    <hr/>

                    {tax_control_data?.data?.results
                        ?
                        <TaxControlTable tax_control_data={tax_control_data.data.results}/>
                        :
                        <div className={"w-100 d-flex justify-content-center"}>
                            <div>
                                Нет данных
                            </div>
                        </div>
                    }
                    {tax_control_data?.is_loading && !tax_control_data.data?.results && skeleton}
                </PageWithPagination>
            </section>
        </DynamicModuleLoader>
    )
        ;
});

export default TaxControlPage;
