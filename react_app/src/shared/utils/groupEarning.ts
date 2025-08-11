import type {IEarning} from "@/entities/salary";

interface IGroupedEarning {
    date: string;
    name: string;
    amount: number;
    quantity: number;
    total: number;
    earning_type: string;
    comment: string;
}

interface IGroupedByDateType {
    date: string;
    earning_type: string;
    sum: number;
}

export const groupEarnings = (earnings: IEarning[]): IGroupedEarning[] => {
    const groups = earnings.reduce((acc, earning) => {
        const date = earning.target_date.split('T')[0];
        const key = `${date}-${earning.comment}-${earning.amount}`;
        if (!acc[key]) {
            acc[key] = {
                date: date,
                name: earning.comment,
                amount: earning.amount,
                quantity: 0,
                total: 0,
                earning_type: earning.earning_type,
                comment: earning.earning_comment || ''
            };
        }
        acc[key].quantity += 1;
        acc[key].total = acc[key].amount * acc[key].quantity;
        return acc;
    }, {} as Record<string, IGroupedEarning>);

    return Object.values(groups);
};

export const groupEarningsByDateType = (earnings: IEarning[]): IGroupedByDateType[] => {
    const groups = earnings.reduce((acc, earning) => {
        const date = earning.target_date.split('T')[0];
        const key = `${date}-${earning.earning_type}-${earning.amount > 0}`;
        if (!acc[key]) {
            acc[key] = {
                date: date,
                earning_type: earning.earning_type,
                sum: 0,
            };
        }
        acc[key].sum += earning.amount;
        return acc;
    }, {} as Record<string, IGroupedByDateType>);

    return Object.values(groups);
};