import {EqNumberListTipe} from "./createEqNumberLists";
import {EqAssignment} from "@widgets/EqCardList/model/types";

export interface setTargetNumberProps extends EqNumberListTipe {
    value: EqAssignment;
}

export const setTargetNumber = (props: setTargetNumberProps): EqNumberListTipe => {
    const {confirmed, coExecuted, lockedNums, primary, secondary, selectedLocked, value} = props;

    let newPrimary: EqAssignment[] = [];
    let newSecondary: EqAssignment[] = [];
    let newLockedNums: EqAssignment[] = [];
    let newSelectedLocked: EqAssignment[] = [];

    if (lockedNums.includes(value) || selectedLocked.includes(value)) {
        newSelectedLocked = [value];
        newLockedNums = [
            ...lockedNums.filter(num => num !== value),
            ...selectedLocked.filter(num => num !== value)]
            .sort((a, b) => a.number - b.number);
        newSecondary = [
            ...primary,
            ...secondary]
            .sort((a, b) => a.number - b.number)
    } else if (primary.includes(value) || secondary.includes(value)) {
        newPrimary = [value];
        newSecondary = [
            ...primary.filter(num => num !== value),
            ...secondary.filter(num => num !== value)]
            .sort((a, b) => a.number - b.number);
        newLockedNums = [
            ...lockedNums,
            ...selectedLocked]
            .sort((a, b) => a.number - b.number);
    }

    // Возвращаем оба массива
    return {
        primary: newPrimary,
        secondary: newSecondary,
        confirmed,
        coExecuted,
        selectedLocked: newSelectedLocked,
        lockedNums: newLockedNums
    };
}