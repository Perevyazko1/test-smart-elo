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


const initialReducers: ReducersList = {
    taxControl: taxControlReducer,
}

const TaxControlPage = memo(() => {
    const dispatch = useAppDispatch()
    const tax_control_data = useSelector(getTaxControlData)
    const page_is_loading = useSelector(getTCIsLoading)
    const page_updated = useSelector(getTaxControlUpdated)
    const current_view_mode = useSelector(getTCCurrentViewMode)
    const current_department = useSelector(getTCDepartmentFilter)
    const pin_code = useSelector(getEmployeePinCode)
    const current_product_name_filter = useSelector(getTCProductNameFilter)

    useEffect(() => {
        if (current_view_mode && current_department && pin_code) {
            dispatch(fetchTaxControlList({
                department_number: current_department?.number,
                view_mode: current_view_mode,
                product_name: current_product_name_filter || '',
                pin_code: pin_code,
            }))
        }
    }, [
        dispatch, page_updated, current_view_mode, current_department, current_product_name_filter,
        pin_code
    ])

    useEffect(() => {
        dispatch(fetchTCFilters({}))
    }, [dispatch])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <TCNavBar/>

            <section style={{height: "93vh", background: "#929292"}} className={'p-2'}>
                <Container
                    className={'bg-light bg-gradient p-2 rounded h-100'}
                    style={{overflow: "auto", overflowX: "hidden", overflowY: "auto"}}
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

                    {page_is_loading
                        ?
                        <div className={'w-100 d-flex justify-content-center'}>
                            <Spinner animation="grow"/>
                        </div>
                        :
                        <>
                            {tax_control_data
                                ?
                                <TaxControlTable tax_control_data={tax_control_data}/>
                                :
                                <div className={"w-100 d-flex justify-content-center"}>
                                    <div>
                                        Нет данных
                                    </div>
                                </div>
                            }
                        </>
                    }


                </Container>
            </section>
        </DynamicModuleLoader>
    );
});

export default TaxControlPage;
