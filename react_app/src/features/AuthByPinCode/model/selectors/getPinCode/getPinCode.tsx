import {StateSchema} from "app/providers/StoreProvider";

export const getPinCode = (state: StateSchema) => state?.authByPinCode?.pinCode || 0;