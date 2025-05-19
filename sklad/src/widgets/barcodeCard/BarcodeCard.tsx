"use client"
import Image from 'next/image'
import {useQuery} from "@tanstack/react-query";
import {fetchAssortment} from "@/api/assortmentsApi";
import {HTMLAttributes} from "react";
import {useModal} from "@/lib/hooks/use-modal";
import {LossWidget} from "@/widgets/lossWidget/LossWidget";
import {TListTypes} from "@/api/types";
import {INVENT_ATTRIBUTE_NAME} from "@/api/config";

interface BarcodeCardProps extends HTMLAttributes<HTMLDivElement> {
    barcode: string;
}


export const BarcodeCard = (props: BarcodeCardProps) => {
    const {barcode, ...otherProps} = props;

    const {handleOpen, handleClose} = useModal();

    const {data, isLoading, error} = useQuery({
        queryKey: ['assortment', {param: barcode}],
        queryFn: () => fetchAssortment({
            barcode
        }),
    });

    const getPosition = () => {
        if (data?.meta.size === 1) {
            return data.rows[0];
        }
    };

    const position = getPosition();

    if (isLoading) return <div {...otherProps}>Loading...</div>;
    if (error) return <div {...otherProps}>Error!</div>;
    if (!position) return <div {...otherProps}>ШК {barcode} не найден</div>;

    const showModalHandle = (
        type: TListTypes, color: string,
    ) => {
        handleOpen({
            content: <LossWidget
                type={type}
                color={color}
                position={position}
                barcode={barcode}
                onSuccess={handleClose}
            />,
            title: <h2>{type === 'loss' ? "Списание" : type === 'enter' ? "Оприходование" : "Инвентаризация"}</h2>
        })
    }

    const getPositionImage = () => {
        if (position.images.rows.length > 0) {
            return position.images.rows[0].miniature.downloadHref;
        }
    }

    const positionImage = getPositionImage();

    const inventState = position?.attributes?.find(
        attr => attr.name === INVENT_ATTRIBUTE_NAME
    );
     console.log(position)

    return (
        <div {...otherProps}>
            <div className={'flex gap-1'}>
                <div className={'flex items-center'}>
                    {positionImage && (
                        <Image alt={'Ткань'} src={positionImage} width={75} height={75}/>
                    )}
                </div>
                <div>
                    <span>ШК: {barcode}</span>
                    <br/>
                    <span>
                        ОСТ: {position.quantity} {position.uom.name}
                        {!inventState?.value ? "🔴" : "🟢"}
                    </span>
                    <br/>
                    <span>{position.name}</span>
                </div>
            </div>
            <div className={'flex gap-1 flex-nowrap justify-between'}>
                <button
                    onClick={() => showModalHandle("loss", "yellow")}
                    type={'button'}
                    className={'p-[3] bg-yellow-100 border-2 py-3 flex-1 h-[50]'}
                >
                    Списать
                </button>
                <button
                    type={'button'}
                    className={'p-[3] bg-blue-100 border-2 py-3 flex-1 h-[50]'}
                    onClick={() => showModalHandle("enter", "blue")}
                >
                    Оприх.
                </button>
                <button
                    type={'button'}
                    className={'p-[3] bg-green-200 border-2 py-3 flex-1 h-[50]'}
                    onClick={() => showModalHandle("inventory", "green")}
                >
                    Инв.
                </button>
            </div>
        </div>
    );
};