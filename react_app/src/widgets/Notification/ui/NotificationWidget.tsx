import {useSelector} from "react-redux";
import {ToastContainer} from "react-bootstrap";
import {DynamicModuleLoader, ReducersList} from "shared/components/DynamicModuleLoader/DynamicModuleLoader";

import {getNotifications, notificationsReducer} from "../model/slice/notificationSlice";
import {Notification} from "./Notification";

const reducers: ReducersList = {
    'notifications': notificationsReducer,
}

export const NotificationWidget = () => {
    const notificationsList = useSelector(getNotifications);

    return (
        <DynamicModuleLoader reducers={reducers}>

            <ToastContainer position="top-start" className="mt-1 p-3" style={{zIndex: 1000}}>

                {notificationsList?.data.map((notification) => (
                    <Notification notification={notification}
                                  className={'my-2'}
                                  key={notification.date}
                    />
                ))}

            </ToastContainer>

        </DynamicModuleLoader>
    );
};