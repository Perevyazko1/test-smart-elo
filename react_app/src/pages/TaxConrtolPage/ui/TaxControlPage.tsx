import React, {memo, useEffect} from 'react';
import {Container} from "react-bootstrap";
import logo from "shared/assets/images/SZMK Logo White Horizontal 141x55.png";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";

import {fetchTaxControlList} from "../model/service/fetchTaxControlData";
import {taxControlReducer} from "../model/slice/taxControlPageSlice";
import {useSelector} from "react-redux";
import {getTaxControlData} from "../model/selectors/getTaxControlData/getTaxControlData";
import {TaxControlTable} from "./TaxControlTable/TaxControlTable";


const initialReducers: ReducersList = {
    taxControl: taxControlReducer,
}

const TaxControlPage = memo(() => {
    const dispatch = useAppDispatch()
    const tax_control_data = useSelector(getTaxControlData)


    useEffect(() => {
        dispatch(fetchTaxControlList({}))
    }, [dispatch])

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
                    <h3>Страница назначения тарификаций</h3>
                    <hr/>

                    {tax_control_data
                        ?
                        <TaxControlTable tax_control_data={tax_control_data}/>
                        :
                        <div>Нет данных</div>
                    }

                </Container>
            </section>
        </DynamicModuleLoader>
    );
});

export default TaxControlPage;
