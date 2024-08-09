import React from "react";
import {Assignment} from "@entities/Assignment";

interface SelectPanelProps {
    selectedIds: number[];
    data: Assignment[] | undefined;
    setSelectedIds: (ids: number[]) => void;
}

export const SelectPanel = (props: SelectPanelProps) => {
    const {data, selectedIds, setSelectedIds} = props;

    const selectAll = () => {
        if (data && selectedIds.length !== data.length) {
            setSelectedIds(data.map(assignment => assignment.id));
        } else {
            setSelectedIds([]);
        }
    };
    const selectByStatusClb = (status: 'in_work' | 'await') => {
        if (data) {
            setSelectedIds(
                data.filter(
                    assignment => assignment.status === status
                ).map(
                    item => item.id
                )
            );
        }
    };

    return (
        <div className={'d-flex fs-7 gap-2 align-items-center'}>
            Выделить:
            <button
                className={'appBtn fs-7 p-1'}
                onClick={selectAll}
            >
                Все
            </button>

            <button
                className={'appBtn fs-7 p-1'}
                onClick={() => selectByStatusClb('in_work')}
            >
                В работе
            </button>
            <button
                onClick={() => selectByStatusClb('await')}
                className={'appBtn fs-7 p-1'}
            >
                В ожидании
            </button>

            <button
                onClick={() => setSelectedIds([])}
                className={'appBtn fs-7 p-1'}
            >
                Очистить
            </button>
        </div>
    );
};
