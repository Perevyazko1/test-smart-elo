import {createSelector} from "@reduxjs/toolkit";
import {getAuthByPinCode} from "../getAuthByPinCode/getAuthByPinCode";
import {AuthByPinCodeSchema} from "../../types/authByPinCodeSchema";

export const getPinCode = createSelector(
    getAuthByPinCode,
    (getAuthByPinCode: AuthByPinCodeSchema) => getAuthByPinCode.pinCode
)