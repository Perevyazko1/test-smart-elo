import {useMemo, useState} from "react";
import {Table} from "react-bootstrap";

import altLogo from "./products.png";

import {STATIC_URL} from "@shared/consts";

import {OrderProduct} from "../model/types";

import {OpCommentWidget} from "./OPCommentWidget";
import {ProgressItem} from "./ProgressItem";
import {OpCommentRow} from "./OPComment";


export const OrderDetailPosition = (props: { orderProduct: OrderProduct }) => {
    const {orderProduct} = props;

    const [openDepInfo, setOpenDepInfo] = useState(orderProduct.status === "0");

    const departmentInfoLength = useMemo(() => {
        if (openDepInfo) {
            return Object.keys(orderProduct.departments_info).length + 1;
        } else {
            return 2
        }
    }, [openDepInfo, orderProduct.departments_info]);



    return (
        <Table striped bordered hover size="sm" id={`order-product-id-${orderProduct.id}`}>
            <thead>
            <tr>
                <th style={{
                    minWidth: "150px",
                    maxWidth: "150px",
                    width: "150px"
                }}
                >
                    {orderProduct.quantity} шт
                </th>
                <th colSpan={3}>{orderProduct.product_name}</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td rowSpan={departmentInfoLength}>
                    <b>№ {orderProduct.series_id}</b>
                </td>
                <td rowSpan={departmentInfoLength}>
                    {orderProduct.product_image_url ?
                        <img src={STATIC_URL + orderProduct.product_image_url} alt={'product'}/>
                        :
                        <img src={altLogo} width={'120px'} height={'100px'} alt={'product'}/>
                    }

                </td>
                <td
                    colSpan={2}
                    onClick={() => setOpenDepInfo(!openDepInfo)}
                >
                    <div className={'d-flex justify-content-center align-items-center'}>
                        <b>
                            {openDepInfo
                                ?
                                <>
                                    <i className="far fa-arrow-alt-circle-up mx-xl-3"/>
                                    Информация по отделам
                                    <i className="far fa-arrow-alt-circle-up mx-xl-3"/>
                                </>
                                :
                                <>
                                    <i className="far fa-arrow-alt-circle-down mx-xl-3"/>
                                    Информация по отделам
                                    <i className="far fa-arrow-alt-circle-down mx-xl-3"/>
                                </>
                            }
                        </b>
                    </div>
                </td>
            </tr>

            {openDepInfo ?
                <>
                    {(Object.entries(orderProduct.departments_info)).map(([name, info]) => (
                        <tr key={name}>
                            <td><b>{name}</b></td>
                            <td>
                                <ProgressItem
                                    dangerCount={info.in_work}
                                    secondaryCount={info.await}
                                    successCount={info.ready}
                                />
                            </td>
                        </tr>
                    ))}
                </>
                :
                <>
                    {orderProduct.status === "0" ?
                        <tr>
                            <td colSpan={2}>🧑‍🏭 В работе</td>
                        </tr>
                        :
                        <tr>
                            <td colSpan={2}>Изготовлен ✅</td>
                        </tr>
                    }
                </>
            }


            <tr>
                <td>Комментарии к изделию:</td>
                <td colSpan={3}>
                    {orderProduct.op_comments.map(comment => (
                        <OpCommentRow comment={comment} key={comment.id}/>
                    ))}

                    <OpCommentWidget series_id={orderProduct.series_id}/>

                </td>
            </tr>
            </tbody>
        </Table>
    );
};
