import {notificationsActions} from "widgets/Notification";

export const handleErrors = (error: any, thunkAPI: any) => {
    if (error.response) {
        let errorMessage = "Ошибка обработки запроса"
        if (error.response.data.error) {
            errorMessage = error.response.data.error
        }
        thunkAPI.dispatch(notificationsActions.addNotification({
            date: Date.now(),
            type: "ошибка",
            title: "Ошибка",
            body: errorMessage,
            notAutoHide: true
        }))
        return thunkAPI.rejectWithValue('Ошибка сервера');
    } else if (error.request) {
        thunkAPI.dispatch(notificationsActions.addNotification({
            date: Date.now(),
            type: "ошибка",
            title: "Ошибка связи",
            body: "Ошибка связи с сервером, проверьте подключение",
            notAutoHide: true
        }))
        return thunkAPI.rejectWithValue('Ошибка связи с сервером');
    } else {
        thunkAPI.dispatch(notificationsActions.addNotification({
            date: Date.now(),
            type: "ошибка",
            title: "Ошибка запроса",
            body: "Ошибка запроса данных. Попробуйте перезагрузить страницу.",
            notAutoHide: true
        }))
        return thunkAPI.rejectWithValue('Ошибка запроса');
    }
}