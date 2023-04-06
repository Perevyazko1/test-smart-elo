import {StateSchema} from "app/providers/StoreProvider";

export const getRememberMe = (state: StateSchema) => state?.authByPinCode?.rememberMe || false;