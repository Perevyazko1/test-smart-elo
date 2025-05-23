import Link from "next/link";
import {PageItemInfo} from "@/config/public-page.config";
import {cx} from "@/utils/class-builder";

interface LinkBtmProps {
    item: PageItemInfo;
    text: string;
}

export const LinkBtm = (props: LinkBtmProps) => {
    const {item, text} = props;

    return (
        <Link href={item.link}
              className={cx([
                  'cursor-pointer bg-b_1D text-b_FF text-12 px-15 py-8',
                  'sm:text-16 sm:p-10',
                  'md:p-15',
                  'lg:text-22 lg:px-26 lg:py-20',
                  'xl:'
              ])}
        >
            {text}
        </Link>
    );
};