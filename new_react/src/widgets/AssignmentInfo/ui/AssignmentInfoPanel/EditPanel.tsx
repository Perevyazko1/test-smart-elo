import React, {useEffect, useMemo, useState} from "react";
import {eqPageActions} from "@pages/EqPage";
import {useAppDispatch, useCurrentUser, usePermission} from "@shared/hooks";
import {APP_PERM} from "@shared/consts";
import {useEditAssignmentInfo} from "@widgets/AssignmentInfo/model/api/api";
import {Assignment} from "@entities/Assignment";

interface ServerError {
    data?: {
        error?: string
    }
}

interface EditPanelProps {
    seriesId: string;
    selectedIds: number[];
    data: Assignment[] | undefined;
    disabled: boolean;
}

export const EditPanel = (props: EditPanelProps) => {
    const {seriesId, disabled: panelDisabled, selectedIds, data} = props;

    const {currentUser} = useCurrentUser();
    const dispatch = useAppDispatch();

    const unconfirmedPerm = usePermission(APP_PERM.ASSIGNMENT_UNCONFIRMED);
    const isViewer = usePermission(APP_PERM.ELO_VIEW_ONLY);

    const [inputDate, setInputDate] = useState<string>('');

    const [editAssignments, {isLoading: isEdited, error}] = useEditAssignmentInfo();

    useEffect(() => {
        if (error) {
            const serverError = error as ServerError;
            alert(serverError?.data?.error || 'Ошибка сервера. Обратитесь к администратору.')
        }
    }, [error]);


    const updateClb = (mode: 'selected' | 'remove_visa') => {
        if (currentUser.current_department_details) {
            editAssignments({
                series_id: seriesId,
                department__id: currentUser.current_department_details.id,
                date: inputDate,
                ids: selectedIds,
                mode: mode,
            }).then(() => {
                dispatch(eqPageActions.weekDataHasUpdated());
            })
        }
    };

    const disabled = useMemo(() => {
        return selectedIds.length === 0;
    }, [selectedIds.length]);

    const visaDisabled = useMemo(() => {
        return data?.some(assignment =>
            !assignment.inspector && selectedIds.includes(assignment.id)
        ) || false;
    }, [data, selectedIds]);
    
    const planDateDisabled = useMemo(() => {
        return data?.some(assignment =>
            !!assignment.inspector && selectedIds.includes(assignment.id)
        ) || false;
    }, [data, selectedIds]);

    return (
        <div className={'d-flex fs-7 gap-2 align-items-center'}>
            Наряды:
            <button
                className={'appBtn fs-7 p-1'}
                disabled={isEdited || !unconfirmedPerm || disabled || visaDisabled || panelDisabled}
                onClick={() => updateClb('remove_visa')}
            >
                Снять визу
            </button>

            {!isViewer &&
                <>
                    Плановая дата:
                    <input
                        type="datetime-local"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                    />

                    <button
                        className={'appBtn fs-7 p-1'}
                        disabled={isEdited || disabled || planDateDisabled || panelDisabled}
                        onClick={() => updateClb('selected')}
                    >
                        Назначить
                    </button>
                </>
            }
        </div>
    );
};
