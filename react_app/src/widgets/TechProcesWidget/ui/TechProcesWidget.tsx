import React, {useEffect, useState} from 'react';
import {Button, Table} from "react-bootstrap";

import {GET_STATIC_URL} from "shared/const/server_config";
import {tech_process_schema} from "entities/TechnologicalProcess";
import {TechProcessConstructor} from "../../TechProcessConstructor";
import {useTechProcessMutation} from "../../../features/TechProcessInfo/api/api";
import {notificationsActions} from "../../Notification";
import {useSelector} from "react-redux";
import {EmployeePermissions, getEmployeeHasPermissions, getEmployeePinCode} from "../../../entities/Employee";
import {useAppDispatch} from "../../../shared/lib/hooks/useAppDispatch/useAppDispatch";
import {product} from 'entities/Product';
import {useAppSelector} from "../../../shared/lib/hooks/useAppSelector/useAppSelector";

interface TechProcesWithImageProps {
    product: product;
    schema?: tech_process_schema;
    imageUrl?: string;
    className?: string;
    editClb?: () => void;
    closeEditClb?: () => void;
    editState?: boolean;

    updCallback?: () => void;
}


export const TechProcesWidget = (props: TechProcesWithImageProps) => {
    const {
        product,
        schema,
        imageUrl,
        editState,
        editClb,
        closeEditClb,
        updCallback,
        className,
    } = props;

    const dispatch = useAppDispatch();
    const pinCode = useSelector(getEmployeePinCode);
    const checkPermissions = useAppSelector(getEmployeeHasPermissions);

    const [currentSchema, setCurrentSchema] = useState<tech_process_schema | undefined>(schema)

    useEffect(() => {
        setCurrentSchema(schema)
    }, [schema])

    const [schemaValid, setSchemaValid] = useState<boolean>(true)

    const editPermissions = checkPermissions([
        EmployeePermissions.CHANGE_TECH_PROCESS,
    ]);

    const [postTechProcess, {isLoading}] = useTechProcessMutation();

    const setTechProcess = async (mode: 'with_current_assignments' | 'tech_process_only') => {
        if (pinCode && currentSchema) {
            try {
                await postTechProcess({
                    product_id: product.id,
                    schema: currentSchema,
                    pin_code: pinCode,
                    mode: mode,
                }).unwrap();
                if (updCallback) {
                    updCallback()
                }
                if (closeEditClb) {
                    closeEditClb()
                }
            } catch (error: any) {
                const serverError = error as { data?: { error?: string } }
                if (serverError) {
                    dispatch(notificationsActions.addNotification({
                        date: Date.now(),
                        type: "ошибка",
                        title: "Ошибка",
                        body: serverError.data?.error || 'Ошибка запроса',
                        notAutoHide: true
                    }))
                }
            }
        }
    }

    const getImageWidget = () => {
        if (imageUrl) {
            return (
                <img src={GET_STATIC_URL() + imageUrl}
                     alt={'Без изображения'}
                     loading={"lazy"}
                     style={{maxHeight: '400px', maxWidth: '600px'}}
                />
            )
        } else if (currentSchema) {
            return (
                <TechProcessConstructor
                    schema={currentSchema}
                    disabled={!!editClb}
                    callback={setCurrentSchema}
                    isValidClb={setSchemaValid}
                />
            )
        } else if (product.technological_process?.image) {
            return (
                <img src={GET_STATIC_URL() + product.technological_process.image}
                     alt={'Без изображения'}
                     loading={"lazy"}
                     style={{maxHeight: '400px', maxWidth: '600px'}}
                />
            )
        } else {
            return (
                <TechProcessConstructor
                    schema={product.technological_process?.schema}
                    disabled={!!editClb}
                    callback={setCurrentSchema}
                    isValidClb={setSchemaValid}
                />
            )
        }
    }

    const getTableTitle = () => {
        if (!editClb) {
            return (
                <thead>
                <tr>
                    <td className={"fw-bold text-center bg-gradient bg-light"}>
                        Выбранный технологический процесс
                    </td>
                </tr>
                </thead>
            )
        } else if (product.technological_process?.name && product.technological_process_confirmed) {
            return (
                <thead>
                <tr>
                    <td className={"fw-bold text-center bg-gradient bg-light"}>
                        Текущий технологический процесс: {product.technological_process.name}
                    </td>
                </tr>
                <tr>
                    <td className={"text-center bg-gradient bg-light"}>
                        {`Технологический процесс подтвердил:
                        ${product.technological_process_confirmed.first_name}
                        ${product.technological_process_confirmed.last_name}
                        `}
                    </td>
                </tr>
                </thead>
            )
        } else if (product.technological_process) {
            return (
                <thead>
                <tr>
                    <td colSpan={3} className={"fw-bold text-center bg-gradient bg-light"}>
                        Текущий технологический процесс: {product.technological_process.name}
                    </td>
                </tr>
                </thead>
            )
        }
    }

    const getEditClb = () => {
        if (editClb && !editState) {
            editClb();
        } else if (closeEditClb && !!editState) {
            closeEditClb();
        }
    }

    return (
        <>
            <Table striped bordered className={className}>
                {getTableTitle()}
                <tbody>
                <tr>
                    <td>
                        {getImageWidget()}
                    </td>
                </tr>
                </tbody>
            </Table>

            {editPermissions && editClb &&
                <Button
                    type={'button'}
                    className={'mx-2 mb-2'}
                    onClick={getEditClb}
                    variant={!!editState ? "warning" : "success"}
                >
                    {!!editState ? "Отмена" : "Изменить"}
                </Button>
            }

            {
                currentSchema && editPermissions && !editClb &&
                <div className={'mb-3'}>
                    <Button
                        type={'button'}
                        variant={'success'}
                        className={'mx-2'}
                        onClick={() => setTechProcess('tech_process_only')}
                        disabled={isLoading || !schemaValid}
                    >
                        Изменить для новых заказов
                    </Button>

                    {product.technological_process_confirmed &&
                        <Button
                            type={'button'}
                            variant={'primary'}
                            className={'mx-2'}
                            onClick={() => setTechProcess('with_current_assignments')}
                            disabled={isLoading || !schemaValid}
                        >
                            Изменить для новых и текущих
                        </Button>
                    }
                    <hr/>

                </div>
            }

        </>
    );
};


//     const getEditClb = () => {
//         if (editMode && editClb && closeEditClb) {
//             editClb();
//             setEditMode(false);
//         } else if (!editMode && closeEditClb) {
//             closeEditClb();
//             setEditMode(true);
//         }
//     }
//
//     const editButtonBlock = (
//     )
//
//     return (
//         <>
//             {techProcess.image ?
//                 <Table striped bordered hover className={className}>
//                     <thead>
//                     <tr>
//                         <td colSpan={3} className={"fw-bold text-center bg-gradient bg-light"}>
//                             {techProcess.name}
//                         </td>
//                     </tr>
//                     </thead>
//
//                     <tbody>
//                     <tr>
//                         <td>
//                             <img src={getImageSrc() || ""}
//                                  alt={'Без изображения'}
//                                  loading={"lazy"}
//                                  style={{maxHeight: '300px', maxWidth: '400px'}}
//                             />
//                         </td>
//                     </tr>
//                     </tbody>
//                 </Table>
//                 :
//                 <>
//                     {editMode ?
//                         <TechProcessConstructor schema={techProcess.schema} disabled={true}/>
//                         :
//                         <TechProcessConstructor
//                             schema={techProcess.schema}
//                             btnClb1={btnClb1}
//                             btnClb2={btnClb2}
//                             cancelClb3={cancelClb3}
//                         />
//                     }
//                 </>
//
//             }
//
//             {mode === 'confirm_mode' &&
//                 editButtonBlock
//             }
//
//         </>
//     );
// });