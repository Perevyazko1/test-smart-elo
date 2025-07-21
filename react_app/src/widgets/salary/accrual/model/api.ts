import {$axios} from "@/shared/api";
import type {IEarning} from "@/entities/salary";

interface IConfirmEarningProps {
    date_from: string;
    date_to: string;
    user_id: number;
}


class EarningService {
    createEarning(props: Omit<IEarning, 'id'>) {
        return $axios.post(
            `/salary/earnings/`,
            props,
        );
    }

    confirmEarnings(props: IConfirmEarningProps) {
        return $axios.post(
            `/salary/confirm_earnings/`,
            props,
        )
    }

    deleteEarning(props: {earning_id: number}) {
        return $axios.delete(
            `/salary/earnings/${props.earning_id}/`,
        )
    }
}

export const earningService = new EarningService();
