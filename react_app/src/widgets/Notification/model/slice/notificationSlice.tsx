import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {StateSchema} from "app/providers/StoreProvider";
import {notification, NotificationList} from "../types/notification";


const initialState: NotificationList = {
    data: [],
}

const notificationsSlice = createSlice({
    name: 'notificationSlice',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<notification>) => {
            state.data = [...state.data, action.payload];
        },
        popNotification: (state, action: PayloadAction<number>) => {
            state.data = state.data.filter(
                notification => notification.date !== action.payload
            );
        },
    },
})

export const {reducer: notificationsReducer} = notificationsSlice;
export const {actions: notificationsActions} = notificationsSlice;


export const getNotifications = (state: StateSchema) => state.notifications;