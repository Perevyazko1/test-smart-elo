import {Col, Form, Row, Table} from "react-bootstrap";
import React, {useState} from "react";

import {UseGetAssignmentCounts} from "../../model/api/api";
import {Skeleton} from "../../../../shared/ui/Skeleton/Skeleton";

interface ProductCounterProps {
    employee__id: number;
    date_from: string;
    date_by: string;
}


export const ProductCounter = (props: ProductCounterProps) => {
    const [dateBy, setDateBy] = useState<string>(props.date_by.slice(0, 10));
    const [dateFrom, setDateFrom] = useState<string>(props.date_from.slice(0, 10));

    const {data, isLoading, isFetching} = UseGetAssignmentCounts({
        employee__id: props.employee__id,
        date_by: dateBy,
        date_from: dateFrom,
    })

    const isValidDate = (dateString: string) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;  // Invalid format

        const date = new Date(dateString);
        if (date.getTime() !== date.getTime()) return false;  // Invalid date

        return true;  // Valid date
    };

    return (
        <div className={'border rounded border-2 p-2'}
             style={{
                 maxHeight: '320px',
                 maxWidth: '100%',
                 overflowY: 'auto',
                 overflowX: 'hidden',
             }}
        >
            <Form>
                <Row>
                    <Form.Group controlId="date_from" as={Col} md="6">
                        <Form.Label>Дата с:</Form.Label>
                        <Form.Control type="date" name="date_from"
                                      value={dateFrom}
                                      onChange={(e) => isValidDate(e.target.value) && setDateFrom(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="date_by" as={Col} md="6">
                        <Form.Label>Дата по:</Form.Label>
                        <Form.Control type="date" name="date_by"
                                      value={dateBy}
                                      onChange={(e) => isValidDate(e.target.value) && setDateBy(e.target.value)}
                        />
                    </Form.Group>
                </Row>
            </Form>

            <hr className={'m-2'}/>

            <Table size={'sm'} bordered>
                <thead>
                <tr>
                    <th>Наименование изделия</th>
                    <th>Отдел</th>
                    <th>Колич.</th>
                </tr>
                </thead>

                <tbody>
                {isLoading || isFetching ?
                    <>
                        <tr>
                            <td colSpan={3}><Skeleton width={'100%'} height={'25px'} scaled={false}/></td>
                        </tr>
                        <tr>
                            <td colSpan={3}><Skeleton width={'100%'} height={'25px'} scaled={false}/></td>
                        </tr>
                        <tr>
                            <td colSpan={3}><Skeleton width={'100%'} height={'25px'} scaled={false}/></td>
                        </tr>
                    </>
                    :
                    <>
                        {data?.results.map((assignmentInfo) => (
                            <tr className={'fs-7'} key={assignmentInfo.product_name + assignmentInfo.department_name}>
                                <td>{assignmentInfo.product_name}</td>
                                <td>{assignmentInfo.department_name}</td>
                                <td>{assignmentInfo.count} шт</td>
                            </tr>
                        ))}
                    </>
                }
                </tbody>
            </Table>
        </div>
    )
}

