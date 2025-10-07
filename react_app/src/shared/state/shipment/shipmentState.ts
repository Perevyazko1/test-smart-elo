import {create} from 'zustand';
import type {IPlanDataRow} from "@/entities/plan";


interface IShipment {
    items: IPlanDataRow[];
}


interface ShipmentState {
    shipment: IShipment;
    setShipment: (shipment: IShipment) => void;
    addItem: (item: IPlanDataRow) => void;
}

const initialState: IShipment = {
    items: []
}

export const useShipmentState = create<ShipmentState>((set) => ({
    shipment: initialState,
    setShipment: (shipment: IShipment) => {
        set({shipment})
    },
    addItem: (item: IPlanDataRow) => {
        set((state) => ({
            shipment: {
                items:
                    state.shipment.items.some(i => i.series_id === item.series_id) ?
                        [...state.shipment.items.filter(i => i.series_id !== item.series_id)] :
                        [...state.shipment.items, item]
            }
        }))
    },
}));