import {$axios} from "@/shared/api";
import type {AxiosResponse} from "axios";
import type {IUser} from "@/pages/login/model/types.ts";

interface ILoginProps {
    pin_code: string;
}

class AuthService {
    pinCodeLogin(props: ILoginProps ): Promise<AxiosResponse<IUser>> {
        return $axios.post<IUser>(
            `/staff/pin_code_authentication/`,
            props,
        );
    }
}

export const authService = new AuthService();
