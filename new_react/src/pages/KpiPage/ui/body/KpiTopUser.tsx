interface KpiTopUserProps {
    name: string;
    quantity: number;
    quantity_all: number;
    price: number;
    price_all: number;
}

export const KpiTopUser = (props: KpiTopUserProps) => {
    const {name, price, quantity, quantity_all, price_all} = props;

    return (
        <div className={'w-100 d-flex outlineBox'}>
            <div style={{width: "12rem"}}
                 className={'border border-black px-3'}>

                {name}
            </div>
            <div className={'w-100'}>
                <div className={'px-3 text-center border-black border'}
                     style={{width: `${quantity / quantity_all * 100}%`, backgroundColor: `#FFD966`}}>
                    {quantity} изд.
                </div>
                <div className={'px-3 text-center border-black border'}
                     style={{width: `${price / price_all * 100}%`, backgroundColor: `#8EA9DB`}}>
                    {price} ₽
                </div>
            </div>
        </div>
    );
};