import type {IEarning} from "@/entities/salary";


interface DetailRowProps {
    earning: IEarning;
    balance: number;
}


export const DetailRow = (props: DetailRowProps) => {
    const {earning, balance} = props;

    return (
        <tr>
            <td>Касса</td>
            <td>{earning.user_name}</td>
            <td>{earning.comment}</td>
            <td>{Math.abs(earning.amount > 0 ? earning.amount : 0).toLocaleString('ru-RU')}</td>
            <td>{Math.abs(earning.amount < 0 ? earning.amount : 0).toLocaleString('ru-RU')}</td>
            <td>{balance.toLocaleString('ru-RU')}</td>
        </tr>
    );
};