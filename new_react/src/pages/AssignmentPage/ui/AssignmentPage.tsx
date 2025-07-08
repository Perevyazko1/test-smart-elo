import React, {useEffect, useMemo, useState} from "react";
import {Container, Spinner, Table} from "react-bootstrap";

import cls from './AssignmentPage.module.scss';

import {ModalProvider} from "@app";
import {DynamicComponent, PaginationContainer, QueryContext, ReducersList} from "@features";
import {AppContent, AppSkeleton} from "@shared/ui";
import {useAppDispatch, useAppSelector, useQueryParams} from "@shared/hooks";
import {getPaginationSize} from "@shared/lib";

import {getAssignmentList, getAssignmentProps} from "../model/selectors/assignmentSelector";
import {fetchAssignments} from "../model/service/fetchAssignments";
import {assignmentPageActions, assignmentPageReducer} from "../model/slice/assignmentPageSlice";


import {AssignmentNavBar} from "./ui/AssignmentNavBar";
import {AssignmentPageTableRow} from "./ui/AssignmentPageTableRow";


const initialReducers: ReducersList = {
    assignments: assignmentPageReducer,
}

export const AssignmentPage = () => {
    const dispatch = useAppDispatch();
    const {queryParameters, initialLoad} = useQueryParams();

    // Считаем размер страницы для одного запроса
    const paginationSize = useMemo(() => {
        return getPaginationSize(window.innerHeight, 30, 1.6);
    }, []);

    // Состояние текущего запроса
    const [limitOffset, setLimitOffset] = useState({limit: paginationSize, offset: 0});

    const assignmentProps = useAppSelector(getAssignmentProps);
    const assignmentList = useAppSelector(getAssignmentList.selectAll);

    // Флаг isNext нужен для дальнейшей обработки в редьюсерах
    const getAssignments = (
        isNext: boolean = false,
        limit: number = limitOffset.limit,
        offset: number = limitOffset.offset
    ) => {
        dispatch(fetchAssignments({
            isNext: isNext,
            limit: limit,
            offset: offset,
            ...queryParameters,
        }))
    };

    // При изменении интервала страницы запрашиваем данные
    useEffect(() => {
        if (limitOffset.offset >= paginationSize) {
            getAssignments(true);
        }
        //eslint-disable-next-line
    }, [limitOffset]);

    // Инициализируем параметры при загрузке страницы и запрашиваем данные
    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize, offset: 0});
            getAssignments(false, paginationSize, 0);
            dispatch(assignmentPageActions.listHasUpdated());
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters]);

    // Коллбек установки следующей страницы
    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize,
        })
    }


    const PageSkeletons = useMemo(() => (
        <>
            <tr>
                <td colSpan={10}><AppSkeleton style={{height: '50px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={10}><AppSkeleton style={{height: '50px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={10}><AppSkeleton style={{height: '50px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
        </>
    ), []);

    return (
        <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
            <QueryContext>
                <ModalProvider>
                    <AssignmentNavBar/>

                    <AppContent>
                        <PaginationContainer
                            hasMore={!!assignmentProps.next}
                            scroll_callback={setNextPage}
                            hasUpdated={!!assignmentProps.hasUpdated}
                            data-bs-theme={'light'}
                            className={cls.pageContent}
                        >
                            <div className={cls.stickyWrapper}>
                                <div className="d-flex align-items-center p-2">
                                    <h4 className={'m-0'}>
                                        Страница работы с нарядами
                                        {assignmentProps.isLoading ?
                                            <Spinner animation={'grow'} size={'sm'}/>
                                            :
                                            <>{" "}{assignmentProps.count}</>
                                        }
                                    </h4>
                                </div>
                                <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
                            </div>

                            <Table striped bordered size="sm">
                                <thead>
                                <tr>
                                    <th>Изобр.</th>
                                    <th>№</th>
                                    <th colSpan={2}>Серия / Отдел / Проект</th>
                                    <th>Статус</th>
                                    <th>Исполнитель</th>
                                    <th>Дата готовности</th>
                                    <th>Проверяющий</th>
                                    <th>Дата визы</th>
                                    <th>Дата закреп.</th>
                                </tr>
                                </thead>

                                <tbody>
                                {assignmentProps.isLoading && assignmentList.length === 0 ?
                                    <>{PageSkeletons}</>
                                    :
                                    <>
                                        {
                                            assignmentList.map((assignment) => (
                                                <AssignmentPageTableRow
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                />
                                            ))
                                        }
                                        {!!assignmentProps.next && PageSkeletons}
                                    </>

                                }
                                </tbody>
                            </Table>

                        </PaginationContainer>
                    </AppContent>
                </ModalProvider>
            </QueryContext>
        </DynamicComponent>
    );
};
