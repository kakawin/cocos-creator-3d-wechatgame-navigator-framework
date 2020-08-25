import { loader, SpriteFrame, SpriteComponent, ImageAsset, Rect, geometry } from "cc";

export const setResSpriteFrame = (sprite: SpriteComponent, url: string, callback?: (error: any, spriteFrame: SpriteFrame) => void) => {
    loader.loadRes(url, SpriteFrame, (error: Error, spriteFrame: SpriteFrame) => {
        if (!error) {
            sprite.spriteFrame = spriteFrame;
        } else {
            sprite.spriteFrame = null;
        }
        callback && callback(error, spriteFrame);
    });
}

export const setSpriteFrame = (sprite: SpriteComponent, url: string, callback?: (error: any, spriteFrame: SpriteFrame) => void) => {
    loader.load(url, (error: Error, image: ImageAsset) => {
        if (!error) {
            sprite.spriteFrame = SpriteFrame.createWithImage(image);
        } else {
            sprite.spriteFrame = null;
        }
        callback && callback(error, sprite.spriteFrame);
    });
}

export const isInTimeRange = (date: Date, rangesString: string): boolean => {
    if (!rangesString) return false;
    let dateMinutes = date.getHours() * 60 + date.getMinutes();
    let rangeStringArray = rangesString.split(",");
    for (let rangeString of rangeStringArray) {
        let timeStringArray = rangeString.split("-");
        if (timeStringArray.length === 2) {
            let minTimeArray = timeStringArray[0].split(":");
            let maxTimeArray = timeStringArray[1].split(":");
            let minH = parseInt(minTimeArray[0]);
            let minM = parseInt(minTimeArray[1]);
            let maxH = parseInt(maxTimeArray[0]);
            let maxM = parseInt(maxTimeArray[1]);
            if (!isNaN(minH) && !isNaN(minM) && !isNaN(maxH) && !isNaN(maxM)) {
                if (dateMinutes >= (minH * 60 + minM) && dateMinutes <= (maxH * 60 + maxM)) {
                    return true;
                }
            }
        }
    }
    return false;
}