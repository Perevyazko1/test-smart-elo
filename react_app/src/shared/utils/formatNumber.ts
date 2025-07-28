export const formatNumber = (value: number | null, abs: boolean = true) => {
    if (!value) {
        return "";
    }
    if (abs) {
        return Math.abs(value).toLocaleString('ru-RU');
    }
    return value.toLocaleString('ru-RU');
}