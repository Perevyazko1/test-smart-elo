import {memo} from 'react';

// Swiper
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import {GET_STATIC_URL} from "../../const/server_config";

interface SliderProps {
    price?: number,
    images?: string[],
    width?: string,
    height?: string,
}


export const Slider = memo((props: SliderProps) => {
    const {
        price,
        images,
        width = '100px',
        height = '100px',
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
            style={{width: width, height: height}}
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
                    style={{width: width, height: height}}
                    className={"d-flex justify-content-center align-items-center py-1"}
                    key={image_url}
                >
                    <img
                        src={GET_STATIC_URL() + image_url}
                        style={{maxWidth: width, maxHeight: height}}
                        className="rounded m-0 p-0"
                        alt={"Slide"}
                        loading={"lazy"}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
});
