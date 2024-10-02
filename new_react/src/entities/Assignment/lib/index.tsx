import React, {ReactNode} from "react";
import {Assignment, AssignmentStatus} from "../types/assignment";

export const getAssignmentStatusName = (status: AssignmentStatus | null): string => {
    if (!status) {
        return "";
    }
    switch (status) {
        case 'await':
            return 'В ожидании';
        case 'in_work':
            return 'В работе';
        case 'ready':
            return 'Готов';
        case 'created':
            return 'Создан';
    }
}

export const getAssignmentStatusProps = (assignment: Assignment): { icon: ReactNode, name: string } => {
    switch (assignment.status) {
        case 'await':
            return {icon: '', name: getAssignmentStatusName('await')}
        case 'in_work':
            return {icon: <i className="fas fa-tools text-warning me-2 fs-6"/>, name: getAssignmentStatusName('in_work')}
        case 'ready':
            if (assignment.inspector) {
                return {icon: <i className="far fa-check-circle text-success me-2 fs-6"/>, name: getAssignmentStatusName('ready')}
            } else {
                return {icon: <i className="far fa-check-circle text-danger me-2 fs-6"/>, name: getAssignmentStatusName('ready')}
            }
        case 'created':
            return {icon: '', name: getAssignmentStatusName('created')}
    }
};