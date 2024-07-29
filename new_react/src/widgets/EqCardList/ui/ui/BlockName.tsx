export const BlockName = (props: {name: string}) => {

    return (
        <div style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "62px", /* Диаметр четверти круга */
            height: "62px", /* Диаметр четверти круга */
            backgroundColor: "rgba(91,91,91,0.1)", /* Цвет фона четверти круга */
            borderTopLeftRadius: "62px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
        }}>
            <div
                style={{
                    transform: "rotate(-45deg)",
                    fontSize: "10px", /* Размер текста */
                    color: "rgba(0, 0, 0, 0.3)", /* Цвет текста и прозрачность */
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 100,
                    fontWeight: "bold"
                }}
            >
                {props.name}
            </div>
        </div>
    );
};
