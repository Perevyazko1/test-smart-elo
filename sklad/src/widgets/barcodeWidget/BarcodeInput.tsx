import {useEffect, useRef, useState} from "react";
import {useModal} from "@/lib/hooks/use-modal";

interface BarcodeInputProps {
    setBarcodes: (barcodes: string[]) => void;
    barcodes: string[];
    readyToScan: boolean;
}

export const BarcodeInput = ({setBarcodes, barcodes, readyToScan}: BarcodeInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [barcode, setBarcode] = useState<string>('');
    const [isManualMode, setIsManualMode] = useState<boolean>(false);
    const {isActive} = useModal();

    const addBarcode = (code: string) => {
        if (barcodes.includes(code)) {
            const barcodeItem = document.getElementById(code);
            if (barcodeItem) {
                barcodeItem.scrollIntoView({behavior: "smooth"});
                barcodeItem.classList.add('animate-bounce');
                setTimeout(() => {
                    barcodeItem.classList.remove('animate-bounce');
                }, 1500);
            }
        } else {
            setBarcodes([code, ...barcodes]);
        }
    };

    // Глобальный обработчик сканирования
    useEffect(() => {
        if (!readyToScan || isManualMode || isActive) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                if (barcode.trim()) {
                    addBarcode(barcode.trim());
                    setBarcode('');
                }
            } else {
                // Добавляем символ к строке
                if (/^[a-zA-Z0-9]$/.test(event.key)) {
                    setBarcode(prev => prev + event.key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [barcode, readyToScan, isManualMode]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBarcode(event.target.value);
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && barcode.trim()) {
            addBarcode(barcode.trim());
            setBarcode('');
            setIsManualMode(false); // Вернуть глобальный режим после ручного ввода
            inputRef.current?.blur();
        }
    };

    const handleInputFocus = () => {
        setIsManualMode(true); // Вошли в ручной режим
    };

    return (
        <input
            type="text"
            ref={inputRef}
            value={barcode}
            disabled={!readyToScan}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            className="p-2 w-full disabled:border-gray-500 border-2 border-green-700 outline-0"
            placeholder={isManualMode ? "[РУЧНОЙ ВВОД]" : "[СКАНЕР]"}
        />
    );
};
