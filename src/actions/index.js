import { STORE_IMAGE } from "../types/actions";

export function storeImage(image) {
    return { type: STORE_IMAGE, image };
  }