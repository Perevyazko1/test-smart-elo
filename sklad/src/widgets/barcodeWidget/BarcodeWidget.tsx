"use client"
import {useState} from "react";
import {BarcodeCard} from "@/widgets/barcodeCard/BarcodeCard";
import {BarcodeInput} from "@/widgets/barcodeWidget/BarcodeInput";
import {InitData} from "@/widgets/barcodeWidget/InitData";


export const BarcodeWidget = () => {
    const [barcodes, setBarcodes] = useState<string[]>([]); // Список считанных штрихкодов
    const [inited, setInited] = useState<boolean>(false);

    return (
        <div className="p-2">
            <h1 className="text-xl font-bold">
                <span> Сканер штрихкодов <InitData inited={inited} setInited={setInited}/></span>
            </h1>

            <BarcodeInput setBarcodes={setBarcodes} barcodes={barcodes} readyToScan={inited}/>

            <div className="mt-2">
                <h2 className="text-lg font-semibold">Считанные штрихкоды:</h2>
                {barcodes.length === 0 ? (
                    <p>Штрихкоды не считаны</p>
                ) : (
                    <div>
                        {barcodes.map((code) => (
                            <BarcodeCard key={code} barcode={code} id={code} className={'border-b-1 py-2'}/>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};