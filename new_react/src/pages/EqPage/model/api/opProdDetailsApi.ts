import {rtkAPI} from "@shared/api";
import {ResponseProdInfo} from "@pages/EqPage/model/types";


const OpProdDetailsApi = rtkAPI.injectEndpoints({
    endpoints: (build) => ({
        getProdDetails: build.query<ResponseProdInfo, { series_id: string }>({
            query: (props: {series_id: string}) => ({
                url: '/core/get_op_prod_info',
                params: {
                    series_id: props.series_id,
                }
            }),
        }),
    }),
});

export const useProdDetails = OpProdDetailsApi.useGetProdDetailsQuery;