import React, {useCallback, useEffect, useState} from "react";
import {Container, Dropdown, DropdownButton, Nav, Spinner, Table} from "react-bootstrap";

import {classNames} from "shared/lib/classNames/classNames";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {DepartmentFilter} from "widgets/DepartmentFilter/ui/DepartmentFilter";
import {department} from "entities/Department";
import {useAppSelector} from "shared/lib/hooks/useAppSelector/useAppSelector";
import {getEmployeeDepartments} from "entities/Employee";
import {useQueryParams} from "shared/lib/hooks/useQueryParams/useQueryParams";
import {AppInput} from "shared/ui/AppInput/AppInput";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getPaginationSize} from "shared/api/configs";
import {useDebounce} from "shared/lib/hooks/useDebounce/useDebounce";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {PageWithPagination} from "shared/ui/PageWithPagination/PageWithPagination";

import {TariffElement} from "../TariffElement/TariffElement";
import {tariffPageSliceActions, tariffPageSliceReducer} from "../../model/slice/TariffPageSlice";
import {fetchTariffs} from "../../model/service/fetchTariffs";
import {getTariffList, getTariffProps} from "../../model/selectors/tariffSelector";

import {useProjectsList} from "../../model/api/api";
import {TARIFF_STATUSES} from "../../model/consts/consts";

import cls from './TariffPage.module.scss';

const initialReducers: ReducersList = {
    tariff: tariffPageSliceReducer,
}


const TariffPage = () => {
    const dispatch = useAppDispatch();
    const {setQueryParam, queryParameters, initialLoad} = useQueryParams();
    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    )

    const tariffList = useAppSelector(getTariffList.selectAll);
    const tariffProps = useAppSelector(getTariffProps);

    const {data} = useProjectsList({mode: 'active'});


    const paginationSize = useCallback(() => {
        return getPaginationSize(window.innerHeight, 80, 1.6);
    }, [])
    const [limitOffset, setLimitOffset] = useState({limit: paginationSize(), offset: 0});

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
    }

    useEffect(() => {
        if (!initialLoad) {
            setLimitOffset({limit: paginationSize(), offset: 0})
            getTariffCards(false, paginationSize(), 0);
            dispatch(tariffPageSliceActions.listHasUpdated())
        }
        //eslint-disable-next-line
    }, [initialLoad, queryParameters])

    useEffect(() => {
        if (limitOffset.offset >= paginationSize()) {
            getTariffCards(true);
        }
        //eslint-disable-next-line
    }, [limitOffset])

    const [productNameInput, setProductNameInput] = useState<string>(
        queryParameters.product__name || ''
    )
    const [currentProject, setCurrentProject] = useState<string>(
        queryParameters.project || 'Все проекты'
    )
    const [currentStatus, setCurrentStatus] = useState<string>(
        queryParameters.tariff_status && queryParameters.tariff_status in TARIFF_STATUSES ?
            TARIFF_STATUSES[queryParameters.tariff_status as keyof typeof TARIFF_STATUSES]
            :
            TARIFF_STATUSES.all
    )

    useEffect(() => {
        debouncedSetQueryParam('product__name', productNameInput)
        // eslint-disable-next-line
    }, [productNameInput])

    const allDepartment: department = {number: 100, name: 'Все отделы'}
    const departments = useAppSelector(getEmployeeDepartments)
    const getInitialDepartment = (): department => {
        const queryDepartmentName = queryParameters.department__name
        if (queryDepartmentName) {
            return departments?.find(department => department.name === queryDepartmentName) || allDepartment;
        } else {
            return allDepartment;
        }
    }
    const [currentDepartment, setCurrentDepartment] = useState<department>(getInitialDepartment());

    const setNextPage = () => {
        setLimitOffset({
            limit: limitOffset.limit,
            offset: limitOffset.offset + paginationSize()
        })
    }

    return (
        <DynamicModuleLoader reducers={initialReducers}>
            <Container className={classNames(cls.pageContainer, {}, [])}
                       fluid
                       data-bs-theme={'dark'}
            >
                <AppNavbar>
                    <Nav className="me-auto">
                        <AppInput placeholder={'Наименование продукта'}
                                  className={'my-auto ms-3 my-1'}
                                  onChange={(event) => setProductNameInput(event.target.value)}
                                  value={productNameInput}
                                  inputSize={'sm'}
                        />

                        <DepartmentFilter
                            currentDepartment={currentDepartment}
                            departments={departments?.filter((department) => department.piecework_wages === true)}
                            additionalDepartments={[allDepartment]}
                            setDepartmentCallback={(department) => {
                                setCurrentDepartment(department);
                                setQueryParam(
                                    'department__name',
                                    department.name === 'Все отделы' ? "" : department.name
                                )
                            }}
                            className={'my-auto ms-2 my-1'}
                        />

                        <DropdownButton
                            variant={"outline-light"}
                            title={currentProject}
                            className={"my-auto ms-2 my-1"}
                        >
                            <Dropdown.ItemText>
                                <h6 className={"my-0"}>Выберите проект</h6>
                            </Dropdown.ItemText>

                            <Dropdown.Divider/>

                            {data?.data.map((project_name) => (
                                <div key={project_name}>
                                    <Dropdown.Item
                                        active={currentProject === project_name}
                                        onClick={() => {
                                            setCurrentProject(project_name);
                                            setQueryParam(
                                                'project',
                                                project_name === 'Все проекты' ? "" : project_name
                                            );
                                        }}
                                    >
                                        {project_name}
                                    </Dropdown.Item>
                                </div>
                            ))}

                        </DropdownButton>

                        <DropdownButton
                            variant={"outline-light"}
                            title={currentStatus}
                            className={"my-auto ms-2 my-1"}
                        >
                            <Dropdown.ItemText>
                                <h6 className={"my-0"}>Выберите статус</h6>
                            </Dropdown.ItemText>

                            <Dropdown.Divider/>

                            {Object.entries(TARIFF_STATUSES).map(([key, value]) => (
                                <div key={key}>
                                    <Dropdown.Item
                                        active={currentStatus === value}
                                        onClick={() => {
                                            setCurrentStatus(value);
                                            setQueryParam(
                                                'tariff_status',
                                                value === TARIFF_STATUSES.all ? "" : key
                                            );
                                        }}
                                    >
                                        {value}
                                    </Dropdown.Item>
                                </div>
                            ))}

                        </DropdownButton>

                        <UpdatePageBtn
                            style={{height: '39px'}}
                            className={'my-auto ms-2 border border-light border-1 rounded px-1 bg-body-tertiary px-3'}
                        />

                    </Nav>

                    <Nav>
                        <UserInfoWithRouts
                            className={"ms-xl-2 my-xl-0 my-xxl-0 my-1 border border-2 rounded px-1"}
                            active
                        />
                    </Nav>

                </AppNavbar>

                <PageWithPagination
                    hasUpdated={!!tariffProps.hasUpdated}
                    data-bs-theme={'light'}
                    className={classNames(cls.pageContent, {}, ['pt-3 px-5'])}
                    hasMore={!!tariffProps.next}
                    scroll_callback={setNextPage}
                    skeleton={
                        <Skeleton
                            height={'60px'}
                            width={'100%'}
                            rounded={false}
                            className={'mb-2 scaled'}
                            pagination_size={3}
                        />}
                >

                    <div className="d-flex align-items-center">
                        <h3>
                            Новая страница контроля тарификаций
                        </h3>
                        {tariffProps.isLoading && <Spinner animation={'grow'} size={'sm'} className={'ms-2'}/>}
                    </div>
                    <hr className={'p-0 m-1 mb-2 w-25'}/>

                    {tariffProps.isLoading && tariffList.length === 0
                        ?
                        <Skeleton
                            height={'60px'}
                            width={'100%'}
                            rounded={false}
                            className={'mb-2 scaled'}
                            pagination_size={3}
                        />
                        :
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
                            {tariffList && tariffList.map((card) => (
                                <TariffElement
                                    key={card.id}
                                    card={card}
                                />
                            ))}
                            </tbody>
                        </Table>
                    }
                </PageWithPagination>

            </Container>
        </DynamicModuleLoader>
    );
};

export default TariffPage;