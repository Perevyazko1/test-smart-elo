import React, {memo, useEffect, useState} from 'react';
import {Modal, Table} from "react-bootstrap";
import {useSelector} from "react-redux";

import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {getEmployeeFullName, getEmployeePinCode} from "entities/Employee";
import {Loader} from "shared/ui/Loader/Loader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {fetchAuditList} from "../model/service/fetchAuditWidget";
import {auditWidgetReducer} from "../model/slice/auditWidgetSlice";
import {getAuditWidgetIsLoading} from "../model/selectors/getAuditWidgetIsLoading/getAuditWidgetIsLoading";
import {getAuditWidgetData} from "../model/selectors/getAuditWidgetData/getAuditWidgetData";


const initialReducers: ReducersList = {
    auditWidget: auditWidgetReducer
}

interface AuditWidgetProps {
    onHide: () => void,
}


export const AuditWidget = memo((props: AuditWidgetProps) => {

    const [showModal, setShowModal] = useState(true)
    const pin_code = useSelector(getEmployeePinCode)
    const dispatch = useAppDispatch()

    const audit_list = useSelector(getAuditWidgetData)
    const full_name = useSelector(getEmployeeFullName)
    const is_loading = useSelector(getAuditWidgetIsLoading)

    const get_humans_datetime = (utc_datetime: string) => {
        const dateTime = new Date(utc_datetime);
        const date = dateTime.toLocaleDateString(
            'ru-RU',
            {day: '2-digit', month: '2-digit', year: 'numeric'}
        );
        const time = dateTime.toLocaleTimeString(
            'ru-RU',
            {hour: '2-digit', minute: '2-digit', second: '2-digit'}
        );

        return `${date} - ${time}`

    }

    const hide_modal = () => {
        setShowModal(false)
        setTimeout(() => {
            props.onHide()
        }, 300)
    }

    useEffect(() => {
        if (pin_code) {
            dispatch(fetchAuditList({pin_code: pin_code}))
        }
    }, [dispatch, pin_code])

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Modal show={showModal} onHide={hide_modal} size={'xl'} scrollable={true}>
                {is_loading
                    ?
                    <Loader/>
                    :
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>История действий пользователя: {full_name}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <Table striped bordered hover size="sm">
                                <thead>
                                <tr>
                                    <th>Дата / время</th>
                                    {/*<th>Тип</th>*/}
                                    <th>Детализация</th>
                                </tr>
                                </thead>
                                <tbody>
                                {audit_list?.map((audit) => (
                                    <tr key={audit.date}>
                                        <td>{get_humans_datetime(audit.date)}</td>
                                        {/*<td>{audit.audit_type}</td>*/}
                                        <td>{audit.details}</td>
                                    </tr>
                                ))}

                                </tbody>
                            </Table>
                        </Modal.Body>
                    </>
                }
            </Modal>
        </DynamicModuleLoader>
    )
        ;
});