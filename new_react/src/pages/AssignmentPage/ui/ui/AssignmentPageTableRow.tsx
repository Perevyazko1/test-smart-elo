import React, {useMemo} from "react";

import {Assignment, getAssignmentStatusProps} from "@entities/Assignment";
import {getHumansDatetime} from "@shared/lib";
import {useAppModal, useEmployeeName, useProductPictures, useQueryParams} from "@shared/hooks";
import {AppSlider, AppTooltip} from "@shared/ui";


interface AssignmentPageTableRowProps {
    assignment: Assignment;
}

export const AssignmentPageTableRow = (props: AssignmentPageTableRowProps) => {
    const {assignment} = props;
    const {handleOpen} = useAppModal();
    const {getNameById} = useEmployeeName();

    const {queryParameters, setQueryParam} = useQueryParams();

    const {thumbnails, images} = useProductPictures(assignment.order_product.product);

    const getStatusProps = getAssignmentStatusProps(assignment);

    const setStatusHandle = () => {
        if (queryParameters.status === assignment.status) {
            setQueryParam('status', '')
        } else {
            setQueryParam('status', assignment.status)
        }
    };

    const statusActive = useMemo(() => {
        return queryParameters.status === assignment.status;
    }, [assignment.status, queryParameters.status]);

    const setExecutorHandle = () => {
        if (queryParameters.executor === String(assignment.executor)) {
            setQueryParam('executor', '');
        } else {
            setQueryParam('executor', String(assignment.executor));
        }
    };

    const executorActive = useMemo(() => {
        return queryParameters.executor === String(assignment.executor);
    }, [assignment.executor, queryParameters.executor]);

    const setInspectorHandle = () => {
        if (queryParameters.inspector === String(assignment.inspector)) {
            setQueryParam('inspector', '');
        } else {
            setQueryParam('inspector', String(assignment.inspector));
        }
    };

    const inspectorActive = useMemo(() => {
        return queryParameters.inspector === String(assignment.inspector);
    }, [assignment.inspector, queryParameters.inspector]);

    const departmentActive = useMemo(() => {
        return queryParameters.department__id === String(assignment.department.id);
    }, [assignment.department.id, queryParameters.department__id]);

    const setDepartmentHandle = () => {
        if (queryParameters.department__id === String(assignment.department.id)) {
            setQueryParam('department__id', '');
        } else {
            setQueryParam('department__id', String(assignment.department.id));
        }
    };

    const setSeriesIdHandle = () => {
        if (queryParameters.order_product__series_id === assignment.order_product.series_id) {
            setQueryParam('order_product__series_id', '');
        } else {
            setQueryParam('order_product__series_id', assignment.order_product.series_id);
        }
    };
    const seriesIdActive = useMemo(() => {
        return queryParameters.order_product__series_id === assignment.order_product.series_id;
    }, [assignment.order_product.series_id, queryParameters.order_product__series_id]);

    const productActive = useMemo(() => {
        return queryParameters.order_product__product__id === String(assignment.order_product.product.id);
    }, [assignment.order_product.product.id, queryParameters.order_product__product__id]);

    const setProductHandle = () => {
        if (queryParameters.order_product__product__id === String(assignment.order_product.product.id)) {
            setQueryParam('order_product__product__id', '');
        } else {
            setQueryParam('order_product__product__id', String(assignment.order_product.product.id));
        }
    };

    const projectActive = useMemo(() => {
        return queryParameters.order_product__order__project === assignment.order_product.order.project;
    }, [assignment.order_product.order.project, queryParameters.order_product__order__project]);

    const setProjectHandle = () => {
        if (queryParameters.order_product__order__project === assignment.order_product.order.project) {
            setQueryParam('order_product__order__project', '');
        } else {
            setQueryParam('order_product__order__project', assignment.order_product.order.project);
        }
    };

    return (
        <>
            <tr className={'align-middle fs-7'}>
                <td rowSpan={2}
                    onClick={() => handleOpen(
                        <AppSlider
                            images={images}
                            width={'90dvw'}
                            height={'90dvh'}
                        />)}
                >
                    <AppSlider
                        price={assignment.new_tariff?.amount}
                        images={thumbnails}
                        width={'45px'}
                        height={'45px'}
                    />
                </td>
                <td rowSpan={2} className={'fw-bold fs-6 text-center'}>{assignment.number}</td>
                <td className={'fs-6 ' + (seriesIdActive ? "bg-warning" : "bg-light")}
                    onClick={setSeriesIdHandle}
                    style={{cursor: 'pointer'}}
                >
                    <AppTooltip title={'Отфильтровать по номеру серии'}>
                        <>{assignment.order_product.series_id}</>
                    </AppTooltip>
                </td>
                <td
                    onClick={setDepartmentHandle}
                    style={{
                        backgroundColor: departmentActive ? "var(--bs-warning)" : assignment.department.color,
                        cursor: 'pointer',
                    }}
                >
                    <AppTooltip title={'Отфильтровать по отделу'}>
                        <>{assignment.department.name}</>
                    </AppTooltip>
                </td>

                <td
                    className={'text-nowrap ' + (statusActive ? "bg-warning" : "bg-light")}
                    onClick={setStatusHandle}
                    style={{cursor: 'pointer'}}
                >
                    <AppTooltip title={'Отфильтровать по статусу'}>
                        <>
                            {getStatusProps.icon}
                            <b>{getStatusProps.name}</b>
                        </>
                    </AppTooltip>
                </td>

                <td
                    onClick={setExecutorHandle}
                    className={executorActive ? "bg-warning" : "bg-light"}
                    style={{cursor: 'pointer'}}
                >
                    <AppTooltip title={'Отфильтровать по исполнителю'}>
                        <>
                            {getNameById(assignment.executor, "nameLastName")}
                        </>
                    </AppTooltip>
                </td>

                <td>{getHumansDatetime(assignment.date_completion || '')}</td>

                <th
                    onClick={setInspectorHandle}
                    className={inspectorActive ? "bg-warning" : "bg-light"}
                    style={{cursor: 'pointer'}}
                >
                    <AppTooltip title={'Отфильтровать по проверяющему'}>
                        <>
                            {getNameById(assignment.inspector, 'nameLastName')}
                        </>
                    </AppTooltip>
                </th>
                <td>{getHumansDatetime(assignment.inspect_date || '')}</td>
            </tr>

            <tr className={'align-middle fs-7'}>
                <td colSpan={2}
                    className={projectActive ? "bg-warning" : "bg-light"}
                    onClick={setProjectHandle}
                    style={{cursor: 'pointer'}}
                >

                    <AppTooltip title={'Отфильтровать по проекту'}>
                        <>
                            {assignment.order_product.order.project}
                        </>
                    </AppTooltip>
                </td>


                <td
                    colSpan={6}
                    className={productActive ? "bg-warning" : "bg-light"}
                    onClick={setProductHandle}
                    style={{cursor: 'pointer'}}
                >
                    <AppTooltip title={'Отфильтровать по изделию'}>
                        <>
                            {assignment.order_product.product.name}
                        </>
                    </AppTooltip>
                </td>
            </tr>
        </>
    );
};
