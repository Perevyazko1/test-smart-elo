import {Employee} from "@entities/Employee";

import {StaffInfo} from "../../../model/types";

import { ProductCounter } from "../../ProductCounter/ProductCounter";

import {StaffDetailsHead} from "./ui/StaffDetailsHead";
import {WeekTransactions} from "./ui/WeekTransactions";
import {WeekTotal} from "./ui/WeekTotal";


interface StaffDetailsProps {
    isLoading: boolean;
    selectedEmployee: Employee;
    userInfo: StaffInfo | undefined;
}


export const StaffDetails = (props: StaffDetailsProps) => {
    const {selectedEmployee, userInfo, isLoading} = props;

    return (
        <div
            className={'d-flex bg-secondary-subtle flex-column flex-fill p-1 gap-1 border border-2 border-black'}
            style={{
                maxWidth: "calc(100dvw - 315px)"
            }}
        >
            <StaffDetailsHead selectedEmployee={selectedEmployee}/>

            <div className={'d-flex flex-fill gap-1'} style={{overflow: 'hidden'}}>
                <div
                    className={'bg-gradient bg-info-subtle border border-black'}
                    style={{
                        width: 350,
                        minWidth: 350,
                    }}
                >
                    <WeekTransactions
                        selectedEmployee={selectedEmployee}
                        userInfo={userInfo}
                        isLoading={isLoading}
                    />
                </div>

                <div className={'d-flex flex-column gap-1 flex-fill'}>
                    <div className={'p-2 bg-info-subtle border border-black'}>
                        <WeekTotal isLoading={isLoading} userInfo={userInfo}/>
                    </div>

                    <div
                        className={'px-2 py-1 bg-info-subtle border border-black flex-fill'}
                        style={{overflow: 'auto'}}
                    >
                        {userInfo?.user_total_info && (
                            <ProductCounter
                                employee__id={selectedEmployee.id}
                                date_from={userInfo.user_total_info.I.date_range.start_date}
                                date_by={userInfo.user_total_info.I.date_range.end_date}
                            />
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
};
