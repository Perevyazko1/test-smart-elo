import {createSelector} from "@reduxjs/toolkit";
import {AuthByPinCodeSchema} from "../../types/authByPinCodeSchema";
import {getAuthByPinCodeState} from "../getAuthByPinCodeState/getAuthByPinCodeState";

export const getRememberMe = createSelector(
    getAuthByPinCodeState,
    (getAuthByPinCode: AuthByPinCodeSchema) => getAuthByPinCode.rememberMe
)