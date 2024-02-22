import {APP_PERM, GET_STATIC_URL} from "@shared/consts";
import {TechProcess, TechProcessSchema} from "@entities/TechProcess";
import {TechProcessConstructor} from "@widgets/TechProcessWidget/ui/TechProcessConstructor";
import React, {useCallback, useState} from "react";
import {Button, Table} from "react-bootstrap";
import {useCurrentUser, usePermission} from "@shared/hooks";
import {useTechProcessMutation} from "@widgets/TechProcessWidget/model/api/api";

interface TPSelectedProps {
    variant: 'current' | 'selected';
    productId?: number;
    imageUrl: string;
    title: string;
    schema?: TechProcessSchema;
    setSchema?: (schema: TechProcessSchema) => void;
    techProcess?: TechProcess;
    editClb?: () => void;
    closeEditClb?: () => void;
    updateClb?: () => void;
    edited?: boolean;
    setNewTP?: (techProcess: TechProcess) => void;
    inspector?: string;
}


export const TpSelected = (props: TPSelectedProps) => {
    const {
        variant,
        imageUrl,
        schema,
        setSchema,
        techProcess,
        editClb,
        edited,
        closeEditClb,
        title,
        productId,
        updateClb,
        setNewTP,
        inspector,
    } = props;

    const getImageUrl = useCallback(() => {
        return imageUrl || techProcess?.image || undefined;
    }, [imageUrl, techProcess?.image]);

    const {currentUser} = useCurrentUser();
    const pinCode = currentUser.pin_code;

    const [isValid, setIsValid] = useState<boolean>(true);

    const [postTechProcess, {isLoading}] = useTechProcessMutation();
    const setTechProcess = async () => {
        if (pinCode && schema && productId) {
            try {
                const data = await postTechProcess({
                    product_id: productId,
                    schema: schema,
                    pin_code: pinCode,
                }).unwrap();
                if (setNewTP) {
                    setNewTP(data.data);
                }
                if (closeEditClb) {
                    closeEditClb();
                }
                if (updateClb) {
                    updateClb();
                }
            } catch (error: any) {
                const serverError = error as { data?: { error?: string } }
                console.error(serverError)
                alert(
                    serverError.data?.error
                    ||
                    'Непредвиденная ошибка обновления техпроцесса, обратитесь к администратору'
                )
            }
        }
    }

    const editTPPerm = usePermission(APP_PERM.CHANGE_TECH_PROCESS);

    const getImageWidget = () => {
        if (getImageUrl()) {
            return (
                <img src={GET_STATIC_URL() + getImageUrl()}
                     alt={'Без изображения'}
                     loading={"lazy"}
                     style={{maxHeight: '400px', maxWidth: '600px'}}
                />
            )
        } else if (schema) {
            return (
                <TechProcessConstructor
                    schema={schema}
                    disabled={variant === 'current'}
                    isValidClb={setIsValid}
                    callback={setSchema}
                />
            )
        }
    }

    return (
        <>
            <Table striped bordered>
                <thead>
                <tr>
                    <td className={"fw-bold text-center bg-gradient bg-light"}>
                        {title}
                    </td>
                </tr>
                </thead>
                <tbody>
                {inspector &&
                    <tr>
                        <td>
                            Технологический процесс назначил {inspector}
                        </td>
                    </tr>
                }
                <tr>
                    <td>
                        {getImageWidget()}
                    </td>
                </tr>
                </tbody>
            </Table>

            {!!editClb && !edited && editTPPerm &&
                <Button
                    type={'button'}
                    className={'mx-2 mb-2'}
                    onClick={editClb}
                    variant={"primary"}
                >
                    Изменить
                </Button>
            }

            {!!closeEditClb && edited && editTPPerm &&
                <Button
                    type={'button'}
                    className={'mx-2 mb-2'}
                    onClick={closeEditClb}
                    variant={"warning"}
                >
                    Отмена
                </Button>
            }

            {variant === 'selected' &&
                <>
                    <Button
                        type={'button'}
                        variant={'success'}
                        className={'mx-2 mb-2'}
                        disabled={!isValid || isLoading}
                        onClick={setTechProcess}
                    >
                        Применить
                    </Button>
                </>
            }
        </>
    );
};
