import {EqNumberListTipe} from "@pages/EqPage/model/lib/createEqNumberLists";

export interface setTargetNumberProps extends EqNumberListTipe {
    value: number
}

export const setTargetNumber = (props: setTargetNumberProps): EqNumberListTipe => {
    const {confirmed, lockedNums, primary, secondary, selectedLocked, value} = props;

    let newPrimary: number[] = [];
    let newSecondary: number[] = [];
    let newLockedNums: number[] = [];
    let newSelectedLocked: number[] = [];

    if (lockedNums.includes(value) || selectedLocked.includes(value)) {
        newSelectedLocked = [value];
        newLockedNums = [...lockedNums.filter(num => num !== value), ...selectedLocked.filter(num => num !== value)];
    } else if (primary.includes(value) || secondary.includes(value)) {
        newPrimary = [value];
        newSecondary = [...primary.filter(num => num !== value), ...secondary.filter(num => num !== value)];
    }

    // Возвращаем оба массива
    return {
        primary: newPrimary,
        secondary: newSecondary,
        confirmed,
        selectedLocked: newSelectedLocked,
        lockedNums: newLockedNums
    };
}