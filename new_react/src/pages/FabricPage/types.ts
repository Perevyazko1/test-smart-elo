
export interface IFabric {
    "product_id": string,
    "name": string,
    "moment": string,
    "order": string,
    "order_id": string,
    "project": string,
    "agent": string,
    "quantity": number,
    "shipped": number,
    "payed": number,
    "price": number,
    "stock": number,
    "image": null | string,
}

export interface IPurchaseResponse {
    fabric_cards: {
        [key: string]: IFabric
    }
}
