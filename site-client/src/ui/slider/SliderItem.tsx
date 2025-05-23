"use client";
import { HTMLAttributes, ReactNode, useEffect, useRef } from "react";

interface SliderItemProps extends HTMLAttributes<HTMLDivElement> {
  item: ReactNode;
  itemId: number;
  onShow: (id: number) => void;
  onHide: (id: number) => void;
}

export const SliderItem = (props: SliderItemProps) => {
  const { item, itemId, onShow, onHide, ...otherProps } = props;

  const ref = useRef(null);

  useEffect(() => {
    const item = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onShow(itemId);
        } else {
          onHide(itemId);
        }
      },
      { threshold: 0.1 }
    );

    if (item) {
      observer.observe(item);
    }

    return () => {
      if (item) {
        observer.unobserve(item);
      }
      onHide(itemId);
    };
    //eslint-disable-next-line
  }, []);

  return (
    <div ref={ref} {...otherProps}>
      {item}
    </div>
  );
};
