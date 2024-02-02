import {useAppDispatch, useAppQuery, useAppSelector} from "@shared/hooks";

import React, {useEffect, useMemo, useState} from "react";
import {getPaginationSize} from "@shared/lib";

import {getTariffList, getTariffProps} from "../model/selectors/tariffSelector";
import {fetchTariffs} from "../model/service/fetchTariffs";
import {tariffPageSliceActions} from "../model/slice/TariffPageSlice";
import cls from "@pages/ProductPage/ui/ProductPage.module.scss";
import {PaginationContainer} from "@features";
import {AppSkeleton} from "@shared/ui";
import {Container, Spinner, Table} from "react-bootstrap";
import {TariffElement} from "./TariffElement";


export const TariffPageContent = () => {
    const dispatch = useAppDispatch();

    const {queryParameters, initialLoad} = useAppQuery();
    const tariffList = useAppSelector(getTariffList.selectAll);
    const tariffProps = useAppSelector(getTariffProps);

    const paginationSize = useMemo(() => {
        return getPaginationSize(window.innerHeight, 80, 1.6);
    }, []);

    const [limitOffset, setLimitOffset] = useState({limit: paginationSize, offset: 0});

    const getTariffCards = (
        isNext: boolean = false,
        limit: number = limitOffset.limit,
        offset: number = limitOffset.offset
    ) => {
        dispatch(fetchTariffs({
            isNext: isNext,
            limit: limit,
            offset: offset,
            ...queryParameters,
        }))
    };

    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize, offset: 0})
            getTariffCards(false, paginationSize, 0);
            dispatch(tariffPageSliceActions.listHasUpdated())
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters]);

    useEffect(() => {
        if (limitOffset.offset >= paginationSize) {
            getTariffCards(true);
        }
        //eslint-disable-next-line
    }, [limitOffset]);

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize
        })
    }

    const PageSkeletons = useMemo(() => (
        <>
            <tr>
                <td colSpan={8}><AppSkeleton style={{height: '70px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={8}><AppSkeleton style={{height: '70px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
            <tr>
                <td colSpan={8}><AppSkeleton style={{height: '70px', width: '100%'}} className={'mb-1'}/></td>
            </tr>
        </>
    ), [])


    return (
        <PaginationContainer
            hasMore={!!tariffProps.next}
            scroll_callback={setNextPage}
            hasUpdated={!!tariffProps.hasUpdated}
            data-bs-theme={'light'}
            className={cls.pageContent}
        >
            <div className={cls.stickyWrapper}>
                <div className="d-flex align-items-center p-2">
                    <h4 className={'m-0'}>
                        Страница работы с тарификациями
                        {tariffProps.isLoading && <Spinner animation={'grow'} size={'sm'}/>}
                    </h4>
                </div>
                <hr className={'p-0 me-2 mx-2 mt-0 w-25'}/>
            </div>

            <Container>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th>
                            #
                        </th>
                        <th>Наименование изделия</th>
                        <th>Отдел</th>
                        <th>#</th>
                        <th>
                            Тариф
                        </th>
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
                    {tariffProps.isLoading && tariffList.length === 0
                        ?
                        <>{PageSkeletons}</>
                        : <>
                            {tariffList.map((card) => (
                                <TariffElement
                                    key={card.id}
                                    card={card}
                                />
                            ))}
                        </>
                    }
                    {!!tariffProps.next && PageSkeletons}
                    </tbody>
                </Table>
            </Container>
        </PaginationContainer>
    );
};
