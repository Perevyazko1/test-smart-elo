import React, {useMemo} from "react";
import {Table} from "react-bootstrap";

import {AppSkeleton} from "@shared/ui";
import {useAppSelector} from "@shared/hooks";

import {getPageIsLoading, getPageList} from "../../model/selectors";

import {TableElement} from "./TableElement";

export const BodyTable = () => {
    const listItems = useAppSelector(getPageList);
    const isLoading = useAppSelector(getPageIsLoading);

    const RowSkeleton = useMemo(() => (
        <tr>
            <td colSpan={8}><AppSkeleton style={{height: '70px', width: '100%'}} className={'mb-1'}/></td>
        </tr>
    ), [])

    return (
        <Table bordered size="sm">
            <thead>
            <tr>
                <th>
                    #
                </th>
                <th>Наименование изделия</th>
                <th>Отдел</th>
                <th>#</th>
                <th>Тариф</th>
                <th>Тайминг</th>
                <th>
                    Дата
                </th>
                <th>
                    ФИО
                </th>
                <th>
                    #
                </th>
            </tr>
            </thead>

            <tbody>
            {listItems?.map((item) => <TableElement key={item.id} item={item}/>)}
            {isLoading &&
                <>
                    {RowSkeleton}
                    {RowSkeleton}
                    {RowSkeleton}
                </>
            }
            </tbody>
        </Table>
    );
};
