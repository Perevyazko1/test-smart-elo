import {Product} from "@entities/Product";
import {TechProcessSchema} from "@entities/TechProcess";
import {useCurrentUser} from "@shared/hooks";
import {useCallback, useEffect, useState} from "react";
import {useTechProcessMutation} from "../model/api/api";
import {GET_STATIC_URL} from "@shared/consts";
import {TechProcessConstructor} from "./TechProcessConstructor";
import {Button, Table} from "react-bootstrap";

interface TechProcessSelectedProps {
    product: Product;
    schema?: TechProcessSchema;
    className?: string;
    editClb?: () => void;
    closeEditClb?: () => void;
    editState?: boolean;

    updCallback?: () => void;
}


export const TechProcessSelected = (props: TechProcessSelectedProps) => {
    const {
        product,
        schema,
        editState,
        editClb,
        closeEditClb,
        updCallback,
        className,
    } = props;

    const {currentUser} = useCurrentUser();
    const pinCode = currentUser.pin_code;
    // const checkPermissions = useAppSelector(getEmployeeHasPermissions);

    const [currentSchema, setCurrentSchema] = useState<TechProcessSchema | undefined>(schema)

    useEffect(() => {
        setCurrentSchema(schema)
    }, [schema])

    const [schemaValid, setSchemaValid] = useState<boolean>(true)

    // const editPermissions = checkPermissions([
    //     EmployeePermissions.CHANGE_TECH_PROCESS,
    // ]);

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
                    updCallback();
                }
                if (closeEditClb) {
                    closeEditClb();
                }
            } catch (error: any) {
                const serverError = error as { data?: { error?: string } }
                console.error(serverError)
                // if (serverError) {
                //     dispatch(notificationsActions.addNotification({
                //         date: Date.now(),
                //         type: "ошибка",
                //         title: "Ошибка",
                //         body: serverError.data?.error || 'Ошибка запроса',
                //         notAutoHide: true
                //     }))
                // }
            }
        }
    }

    const getImageUrl = useCallback(() => {
        return product.technological_process?.image;
    }, [product.technological_process])

    const getImageWidget = () => {
        if (getImageUrl()) {
            return (
                <img src={GET_STATIC_URL() + getImageUrl()}
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

            {/*{editPermissions && editClb &&*/}
            <Button
                type={'button'}
                className={'mx-2 mb-2'}
                onClick={getEditClb}
                variant={!!editState ? "warning" : "primary"}
            >
                {!!editState ? "Отмена" : "Изменить"}
            </Button>
            {/*}*/}

            {
                currentSchema &&
                <div className={'mb-3'}>
                    <Button
                        type={'button'}
                        variant={'success'}
                        className={'mx-2'}
                        onClick={() => setTechProcess('tech_process_only')}
                        disabled={isLoading || !schemaValid}
                    >
                        Применить для новых заказов
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
