import React, {memo, useEffect} from 'react';
import {useSelector} from "react-redux";
import {Container, OverlayTrigger, Spinner, Tooltip} from "react-bootstrap";

import logo from "shared/assets/images/SZMK Logo White Horizontal 900х352.png";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";

import {fetchTaxControlList} from "../model/service/fetchTaxControlData/fetchTaxControlData";
import {taxControlReducer} from "../model/slice/taxControlPageSlice";
import {getTaxControlData} from "../model/selectors/getTaxControlData/getTaxControlData";
import {TaxControlTable} from "./TaxControlTable/TaxControlTable";
import {getTaxControlUpdated} from "../model/selectors/getTaxControlUpdated/getTaxControlUpdated";


const initialReducers: ReducersList = {
    taxControl: taxControlReducer,
}

const TaxControlPage = memo(() => {
    const dispatch = useAppDispatch()
    const tax_control_data = useSelector(getTaxControlData)
    const page_updated = useSelector(getTaxControlUpdated)

    useEffect(() => {
        dispatch(fetchTaxControlList({}))
    }, [dispatch, page_updated])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <section
                className={'bg-dark d-flex mb-xl-0 pb-xl-0'}
                style={{height: "7vh"}}
            >
                <img className="py-xl-1 pb-xl-1 px-xl-4 mx-xl-3 my-xl-0" src={logo} alt={"СЗМК"}/>
                <input placeholder={'Наименование изделия'}
                       className={'h-50 w-auto form-control form-control-sm my-auto'}/>

                <UserInfoWithRouts
                    className={'ms-auto h-100 d-xl-flex justify-content-xl-center align-items-xl-center'}/>

            </section>

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

                    {tax_control_data
                        ?
                        <TaxControlTable tax_control_data={tax_control_data}/>
                        :
                        <div className={"w-100 d-flex justify-content-center"}>
                            <Spinner/>
                        </div>
                    }

                </Container>
            </section>
        </DynamicModuleLoader>
    );
});

export default TaxControlPage;
