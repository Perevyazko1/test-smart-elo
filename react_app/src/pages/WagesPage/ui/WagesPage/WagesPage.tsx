import React, {useEffect, useState} from "react";
import {Container, Nav, Table} from "react-bootstrap";

import {classNames} from "shared/lib/classNames/classNames";
import {UpdatePageBtn} from "widgets/UpdatePageBtn";
import {UserInfoWithRouts} from "widgets/UserInfoWithRouts";
import {AppNavbar} from "shared/ui/AppNavbar/AppNavbar";
import {AppInput} from "shared/ui/AppInput/AppInput";
import {Skeleton} from "shared/ui/Skeleton/Skeleton";
import {useQueryParams} from "shared/lib/hooks/useQueryParams/useQueryParams";
import {useDebounce} from "shared/lib/hooks/useDebounce/useDebounce";

import cls from './WagesPage.module.scss';
import {GetWagesList} from "../../model/api/api";
import {DetailsBlock} from "../DetailsBlock/DetailsBlock";
import {WagesItem} from "../../model/types/types";
import {DepartmentFilter} from "../../../../widgets/DepartmentFilter/ui/DepartmentFilter";
import {department} from "../../../../entities/Department";
import {useAppSelector} from "../../../../shared/lib/hooks/useAppSelector/useAppSelector";
import {getEmployeeDepartments} from "../../../../entities/Employee";

const WagesPage = () => {
    const {setQueryParam, queryParameters} = useQueryParams();
    const debouncedSetQueryParam = useDebounce(
        (param: string, value: string) => setQueryParam(param, value),
        500
    )
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
    const [currentDepartment, setCurrentDepartment] = useState<department>(getInitialDepartment())


    const [selectedEmployee, setSelectedEmployee] = useState<WagesItem | null>(null);

    const [nameInputValue, setNameInputValue] = useState<string>('');
    useEffect(() => {
        debouncedSetQueryParam('input_name', nameInputValue)
        // eslint-disable-next-line
    }, [nameInputValue])

    const {data} = GetWagesList({
        ...queryParameters
    });

    useEffect(() => {
        if (data && data.detailed_data.length === 1) {
            setSelectedEmployee(data.detailed_data[0])
        }
    }, [data])

    return (
        <Container className={classNames(cls.pageContainer, {}, [])}
                   fluid
                   data-bs-theme={'dark'}
        >
            <AppNavbar>
                <Nav className="me-auto">
                    <DepartmentFilter
                        currentDepartment={currentDepartment}
                        departments={departments}
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

            <Container fluid className={
                classNames(cls.pageContent, {}, ['d-flex justify-content-start w-100'])
            }>
                <div
                    data-bs-theme={'light'}
                    className={'mt-2 p-0 d-flex w-100'}
                >

                    <div className={
                        classNames(cls.employeeList, {}, ['flex-fill'])
                    }>
                        <Table striped bordered hover size="sm"
                               style={{
                                   width: selectedEmployee ? "300px" : "100%",
                               }}
                               className={cls.tableData}
                        >
                            <thead>

                            <tr>
                                <th
                                    style={{width: '300px', height: '66px'}}
                                    rowSpan={2}
                                >
                                    <div
                                        className={
                                            'fs-5 d-flex fw-bold justify-content-evenly align-items-center w-100 h-100'
                                        }>
                                        ФИО
                                        <AppInput
                                            inputSize={'sm'}
                                            style={{width: '220px'}}
                                            placeholder="ФИО"
                                            value={nameInputValue}
                                            onChange={(event) => setNameInputValue(event.target.value)}
                                        />
                                    </div>
                                </th>

                                {!selectedEmployee &&
                                    <>
                                        <th className={'fw-bold'}>Отдел</th>
                                        {data ?
                                            Object.entries(data.total_data).map(([key, value]) => (
                                                <th className={'fw-bold'} key={key}>
                                                    {key}{value.confirmed && "✅"}
                                                </th>
                                            ))
                                            :
                                            <>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'6vw'} height={'100%'}/></th>
                                            </>
                                        }
                                    </>
                                }
                            </tr>

                            <tr>
                                {!selectedEmployee &&
                                    <>
                                        <th className={'fw-bold'}>
                                            Итого:
                                        </th>
                                        {data ?
                                            Object.entries(data.total_data).map(([key, value]) => (
                                                <th className={'fw-bold'}
                                                    key={key}
                                                >
                                                    {value.total?.toLocaleString("ru-RU")}
                                                </th>
                                            ))
                                            :
                                            <>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                                <th><Skeleton width={'5vw'} height={'100%'}/></th>
                                            </>
                                        }
                                    </>
                                }
                            </tr>
                            </thead>

                            <tbody>
                            {data?.detailed_data.map((employee) => (
                                <tr key={employee.id}>
                                    <td onClick={() => setSelectedEmployee(
                                        selectedEmployee?.id === employee.id ?
                                            null :
                                            employee
                                    )}
                                        style={{height: '66px', width: '300px'}}>
                                        {employee.first_name} {employee.last_name}
                                    </td>
                                    {!selectedEmployee &&
                                        <>
                                            <td style={{
                                                width: '150px',
                                                height: '66px',
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden',
                                                    position: 'relative',
                                                }}>
                                                    {employee.departments?.map((department) => (
                                                        <div
                                                            key={department.id}
                                                            className={'mx-1 px-1'}
                                                            style={{backgroundColor: department.color}}
                                                        >
                                                            {department.name}
                                                            <hr className={'m-1'}/>
                                                        </div>
                                                    ))}
                                                </div>

                                            </td>
                                            <td>{
                                                Number(employee.current_balance).toLocaleString(
                                                    'ru-RU'
                                                )}
                                            </td>
                                            {Object.entries(employee.weeks_info).map(([key, value]) => (
                                                <td key={key}>
                                                    {
                                                        Number(value.total).toLocaleString(
                                                            'ru-RU'
                                                        )
                                                    }
                                                    {value.confirmed && value.total && "✅"}
                                                </td>
                                            ))}
                                        </>
                                    }
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        {!data &&
                            <Skeleton
                                height={'56px'}
                                width={'100%'}
                                rounded={false}
                                className={'mb-2 scaled'}
                                pagination_size={3}
                            />
                        }
                    </div>

                    {selectedEmployee &&
                        <DetailsBlock employee={selectedEmployee}/>
                    }

                </div>
            </Container>
        </Container>
    );
};

export default WagesPage;