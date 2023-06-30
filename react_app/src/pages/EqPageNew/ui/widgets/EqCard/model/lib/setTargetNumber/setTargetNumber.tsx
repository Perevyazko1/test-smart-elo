export const setTargetNumber = (primary: number[], secondary: number[], confirmed: number[], value: number) => {
    // Создаем 2 новых массива
    const newArray1 = [value];
    const newArray2 = [];

    // Добавляем элементы из arr1 в newArray2
    for (let i = 0; i < primary.length; i++) {
        if (primary[i] !== value) {
            newArray2.push(primary[i]);
        }
    }

    // Добавляем элементы из arr2 в newArray2
    for (let i = 0; i < secondary.length; i++) {
        if (secondary[i] !== value) {
            newArray2.push(secondary[i]);
        }
    }

    // Возвращаем оба массива
    return {primary: newArray1, secondary: newArray2, confirmed: confirmed};
}