import {useEffect} from "react";

import {DynamicComponent, ReducersList} from "@features";
import {useAppDispatch, useAppSelector, useCurrentUser} from "@shared/hooks";

import {getAuditWidgetData, getAuditWidgetIsLoading} from "../model/selectors/getAuditWidgetData";
import {fetchAuditList} from "../model/service/fetchAuditWidget";
import {auditWidgetReducer} from "../model/slice/auditWidgetSlice";
import {Spinner, Table} from "react-bootstrap";
import {getHumansDatetime} from "@shared/lib";


const initialReducers: ReducersList = {
    auditWidget: auditWidgetReducer,
}


export const UserActions = () => {
    const auditList = useAppSelector(getAuditWidgetData);
    const isLoading = useAppSelector(getAuditWidgetIsLoading);
    const dispatch = useAppDispatch();

    const {currentUser} = useCurrentUser();
    const fullName = `${currentUser.first_name} ${currentUser.last_name || ''}`;

    useEffect(() => {
        dispatch(fetchAuditList({}))
    }, [dispatch]);

    return (
        <DynamicComponent reducers={initialReducers}>
            {isLoading ?
                <Spinner animation={'grow'}/>
                :
                <div data-bs-theme={'light'}>
                    <h5 className={'px-3'}>История действий пользователя: {fullName}</h5>

                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>Дата / время</th>
                            <th>Детализация</th>
                        </tr>
                        </thead>
                        <tbody>
                        {auditList?.map((audit) => (
                            <tr key={audit.date}>
                                <td>{getHumansDatetime(audit.date)}</td>
                                <td>{audit.details}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            }
        </DynamicComponent>
    );
};
