import React, {memo, useState} from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {Button} from "@mui/material";

export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    const newNotification = () => {
        setTimeout(() =>
                navigator.serviceWorker?.ready.then(registration => {
                    const title = "ЭЛО - Имеются новые задачи!";
                    const options = {
                        icon: '/logo192.png',
                        badge: '/logo192.png',
                        tag: 'newTask',
                        vibrate: [200, 100, 200],
                        data: {url: "/task"},
                        actions: [
                            {
                                action: "open",
                                title: "Открыть",
                            },
                            {
                                action: "dismiss",
                                title: "Закрыть",
                            },
                        ]
                    };
                    registration.showNotification(title, options)
                })
            , 1000
        )
    }

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}>
                </AppNavbar>

                <Button onClick={newNotification}>
                    Уведомление
                </Button>

            </ModalProvider>
        </QueryContext>
    );
});
