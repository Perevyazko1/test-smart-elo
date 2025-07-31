export const formatNumber = (value: number | null, abs: boolean = true) => {
    if (value === null) {
        return "";
    }
    if (abs) {
        return Math.abs(value / 100).toFixed(2);
    }
    return (value / 100).toFixed(2);
}