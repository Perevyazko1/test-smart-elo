import {useEffect, useRef, useState} from "react";

interface BarcodeInputProps {
    setBarcodes: (barcodes: string[]) => void;
    barcodes: string[];
    readyToScan: boolean;
}

export const BarcodeInput = (props: BarcodeInputProps) => {
    const {setBarcodes, barcodes, readyToScan} = props;
    const useFocus = () => {
        const inputRef = useRef<HTMLInputElement>(null)
        const setFocus = () => {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }

        return {inputRef, setFocus}
    }
    const [barcode, setBarcode] = useState<string>('');
    const {inputRef, setFocus} = useFocus();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBarcode(event.target.value);
    };

    useEffect(() => {
        setTimeout(() => {
            setFocus()
        }, 500);
    }, [readyToScan, setFocus]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && barcode) {
            if (barcodes.includes(barcode)) {
                const barcodeItem = document.getElementById(barcode);
                if (barcodeItem) {
                    barcodeItem.scrollIntoView({behavior: "smooth"});
                    barcodeItem.classList.add('animate-bounce')
                    setTimeout(() => {
                        barcodeItem.classList.remove('animate-bounce')
                    }, 1500)
                }
                setBarcode("")
            } else {
                setBarcodes([barcode, ...barcodes]);
                setBarcode('');
            }
            inputRef.current?.blur()
        }
    };

    return (

        <input
            type="text"
            ref={inputRef}
            value={barcode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="p-2 w-[100%] border-gray-500 border-2 active:border-green-700 outline-0 focus:border-green-700"
        />
    );
};