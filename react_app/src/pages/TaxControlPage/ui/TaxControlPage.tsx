import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getPaginationSize} from "shared/api/configs";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {fetchTaxControlList} from "../model/service/fetchTaxControlData/fetchTaxControlData";
import {getTaxControlData, getTaxControlList, taxControlReducer} from "../model/slice/taxControlPageSlice";
import {TaxControlTable} from "./TaxControlTable/TaxControlTable";
import {TCNavBar} from "./TCNavBar/TCNavBar";
import {fetchTCFilters} from "../model/service/fetchTaxControlFilters/fetchTCFilters";
import {fetchNextTaxControlData} from "../model/service/fetchNextTaxControlData/fetchNextTaxControlData";
import {fetchTaxControlCard} from "../model/service/fetchTaxControlData/fetchTaxControlCard";


const initialReducers: ReducersList = {
    taxControl: taxControlReducer,
}

const TaxControlPage = memo(() => {
    const dispatch = useAppDispatch()
    const taxList = useSelector(getTaxControlList.selectAll)
    const taxData = useSelector(getTaxControlData)

    useEffect(() => {
        dispatch(fetchTCFilters({}))
    }, [dispatch])


    useEffect(() => {
        if (taxData?.updated !== undefined)
            dispatch(fetchTaxControlList({
                limit: getPaginationSize(
                    window.screen.height
                ),
                offset: 0,
            }))
    }, [dispatch, taxData?.updated])
    
    useEffect(() => {
        if (taxData?.not_relevant_id && taxData?.not_relevant_id.length > 0) {
            dispatch(fetchTaxControlCard({id: taxData.not_relevant_id[0]}))
        }
    }, [dispatch, taxData?.not_relevant_id])

    const fetchNextData = () => {
        if (taxData?.next) {
            dispatch(fetchNextTaxControlData({next: taxData.next}))
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
                    hasUpdated={!!taxData?.updated}
                    className={'bg-light bg-gradient p-2 rounded h-100 mx-3'}
                    style={{overflow: "auto", overflowX: "hidden", overflowY: "auto"}}
                    hasMore={!!taxData?.next}
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

                    {taxData
                        ?
                        <TaxControlTable tax_control_data={taxList}/>
                        :
                        <div className={"w-100 d-flex justify-content-center"}>
                            <div>
                                Нет данных
                            </div>
                        </div>
                    }
                    {taxData?.is_loading && !taxData && skeleton}
                </PageWithPagination>
            </section>
        </DynamicModuleLoader>
    );
});

export default TaxControlPage;
