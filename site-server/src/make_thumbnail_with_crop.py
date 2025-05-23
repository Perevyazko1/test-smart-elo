import io
import os
from PIL import Image

TARGET_WIDTH = 446
TARGET_HEIGHT = 580


def make_thumbnail_with_crop(image_data: bytes) -> Image.Image:
    with Image.open(io.BytesIO(image_data)) as im:
        im = im.convert("RGB")
        orig_w, orig_h = im.size
        target_ratio = TARGET_WIDTH / TARGET_HEIGHT
        orig_ratio = orig_w / orig_h
        if orig_ratio > target_ratio:
            new_h = TARGET_HEIGHT
            new_w = int(orig_w * new_h / orig_h)
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            new_w = TARGET_WIDTH
            new_h = int(orig_h * new_w / orig_w)
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

        final_w, final_h = im.size
        left = (final_w - TARGET_WIDTH) // 2
        top = (final_h - TARGET_HEIGHT) // 2
        right = left + TARGET_WIDTH
        bottom = top + TARGET_HEIGHT
        im = im.crop((left, top, right, bottom))

        return im
