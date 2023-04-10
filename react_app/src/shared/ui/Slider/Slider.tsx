import {memo} from 'react';

// Swiper
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import {classNames, Mods} from "shared/lib/classNames/classNames";

interface SliderProps {
    price?: number
    images?: string[]
    className?: string
}


export const Slider = memo((props: SliderProps) => {
    const {
        price,
        images
    } = props

    return (
        <Swiper
            // install Swiper modules
            modules={[Pagination, Navigation]}
            spaceBetween={50}
            slidesPerView={1}
            pagination={{
                type: "progressbar",
            }}
            style={{width: "100%", height: "100%"}}
            className={"d-flex justify-content-center align-items-xl-center"}
        >
            <>
                <div
                    style={{
                        position: "absolute",
                        bottom: "5px",
                        margin: "auto",
                        zIndex: "999",
                        opacity: "0.75",
                        pointerEvents: "none"
                    }}
                >
                    <h5 className={"fw-bolder bg-light border rounded "}>
                        {price}
                    </h5>
                </div>
            </>


            {images?.length && images.map((image_url) => (
                <SwiperSlide
                    style={{width: "100%", height: "100%"}}
                    className={"d-flex justify-content-center align-items-center py-1"}
                    key={image_url}
                >
                    <img
                        src={image_url}
                        style={{maxWidth: "100%", maxHeight: "100%"}}
                        className="rounded m-0 p-0"
                        alt={"Slide"}
                        loading={"lazy"}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
});
