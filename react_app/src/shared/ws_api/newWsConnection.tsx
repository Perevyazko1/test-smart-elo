import {Dispatch} from "@reduxjs/toolkit";
import {SERVER_WS_ADDRESS} from "../const/server_config";


export const newWsConnection = (pin_code: number, department_number: number, dispatch: Dispatch) => {
    // Код пользователя передаем в url
    let url = `${SERVER_WS_ADDRESS}/ws/${pin_code}/${department_number}/`

    // Создаем новый экземпляр WS
    let ws = new WebSocket(url)

    // При открытии соединения обновляем статус в памяти
    ws.onopen = () => {
        console.log('WS connected')
    }

    // При закрытии соединения обновляем статус в памяти
    ws.onclose = () => {
        console.log('WS closed')
    }

    // Все инструкции общения с сервером по WS
    ws.onmessage = (e) => {
        console.log('Massage from WS')
        console.log(JSON.parse(e.data))
    }

    return ws
}
