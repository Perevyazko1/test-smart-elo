export type notification = {
    title: string,
    body: string,
    date: number,
    type: "ошибка" | "ошибка запроса" | "безопасность" | "оповещение",
    notAutoHide?: boolean,
}

export type NotificationList = {
    data: notification[],
}