import { PlatformApi, GameRecorder, PlatformType, GameNavigator, GameAd } from "./PlatformApi";

const qg: any = window["qg"];
qg && qg.setLoadingProgress({ progress: 0 });

export interface NativeAdInfo {
    adId: string;
    title: string;
    desc: string;
    icon: string;
    imgUrlList: string[];
    logoUrl: string;
    clickBtnTxt: string;
    creativeType: number;
    interactionType: number;
}

class QuickGameNavigator implements GameNavigator {
    public getGameAd(pos: string, count: number = -1, callback?: (error: any, list: GameAd[]) => void): void {
        let gameAdList: GameAd[] = [];
        callback && callback(null, gameAdList);
    }
    public tapGameAd(pos: string, gameAd: GameAd, callback?: (error: any) => void): void {
        qg.navigateToMiniGame({
            pkgName: gameAd.appid,
            success: () => {
                callback && callback(null);
            },
            fail: (res: any) => {
                callback && callback(res || new Error("tapGameAd fail"));
            }
        });
    }
}

export default class QuickGameApi implements PlatformApi {
    public platform: PlatformType = PlatformType.qg;
    public enterGameTimestamp = Date.now();
    private inInited: boolean = false;
    private isLogined: boolean = false;
    private loginCallbackList: Function[] = [];
    private gameNavigator: GameNavigator;
    private bannerAd: any;
    private bannerAdIsShow: boolean = false;
    private rewardedVideoAd: any;
    private nativeAd: any;
    private nextTick(callback: Function): void {
        setTimeout(() => {
            callback && callback();
        });
    }
    constructor() {
        console.log("QuickGameApi");
        this.gameNavigator = new QuickGameNavigator();
    }
    public init(): void {
        if (!this.inInited) {
            this.inInited = true;

            qg.loadingComplete({
                complete: (res: any) => {
                    console.log("loadingComplete", res);
                }
            });
        }
    }
    public onLogined(callback?: Function): void {
        if (callback) {
            this.loginCallbackList.push(callback);
        }
        if (this.isLogined) {
            while (this.loginCallbackList.length) {
                callback = this.loginCallbackList.shift();
                callback && callback();
            }
        }
    }
    public login(callback?: (error: any, conf: any, data: any, user: any) => void): void {
        console.log("no login");
        callback && this.nextTick(() => {
            callback(null, null, this.getGameData(), null);
            this.isLogined = true;
            this.onLogined();
        });
    }
    public getGameData(): any {
        try {
            return JSON.parse(cc.sys.localStorage.getItem("game_data"));
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    public setGameData(data: any, post?: boolean): void {
        try {
            cc.sys.localStorage.setItem("game_data", JSON.stringify(data));
        } catch (e) {
            console.error(e);
        }
    }
    public onShow(callback: (res: any) => void): void {
        qg.onShow(callback);
    }
    public onHide(callback: (res: any) => void): void {
        qg.onHide(callback)
    }
    public showModal(option: { title?: string, content?: string, confirmText?: string, showCancel?: boolean, cancelText?: string }, callback?: (error: any, confirm: boolean) => void): void {
        let success = (res: { confirm: boolean, cancel: boolean }) => {
            callback && callback(null, res.confirm);
        }
        let fail = (error: any) => {
            callback && callback(error || new Error("showModal fail"), false);
        }
        Object.assign(option, { success, fail });
        qg.showModal(option);
    }
    public loadSubpackage(name: string, callback?: (error: any) => void, onProgress?: (progress: number) => void): void {
        if (qg.loadSubpackage && name) {
            let task = qg.loadSubpackage({
                name,
                success: () => {
                    callback && callback(null);
                },
                fail: (error: any) => {
                    callback && callback(error || new Error("loadSubpackage fail"));
                },
            });
            onProgress && task.onProgressUpdate((res: any) => {
                onProgress(res.progress);
            });
        } else {
            setTimeout(() => {
                callback && callback(null);
            });
        }
    }
    public share(pos: string, callback?: (error: any, isFailed: boolean) => void): void {
        console.log("no share");
        callback && this.nextTick(() => {
            callback(null, false);
        });
    }
    public showRewardedVideoAd(pos?: string, callback?: (error: any, isEnded: boolean) => void): void {
        if (!this.rewardedVideoAd) {
            let videoAd = qg.createRewardedVideoAd({
                adUnitId: "",
            });
            this.rewardedVideoAd = videoAd;
            videoAd.onLoad(() => {
                videoAd.show();
            });
            videoAd.onError((error: any) => {
                callback && callback(error || new Error("showRewardedVideoAd fail"), false)
            });
            videoAd.onClose((res: any) => {
                callback && callback(null, (res && res.isEnded) || res === undefined);
            });
        }
        this.rewardedVideoAd.load();
    }
    public showBannerAd(pos: string = "default", callback?: (error: any) => void): void {
        this.bannerAdIsShow = true;
        console.log("showBannerAd", !!this.bannerAd);
        if (!this.bannerAd) {
            //计算banner位置
            let systemInfo = qg.getSystemInfoSync();
            let screenHeight: number = systemInfo.screenHeight;
            let screenWidth: number = systemInfo.screenWidth;
            let ratio: number = screenHeight / cc.winSize.height;
            let adWidth: number = screenHeight;
            let adHeight: number = adWidth * 0.348;
            let left: number = (screenWidth - adWidth) / 2;
            let top: number = screenHeight - adHeight;

            let bannerAd = qg.createBannerAd({
                adUnitId: "",
                style: {
                    top: top,
                    left: left,
                    width: adWidth,
                    height: adHeight
                }
            });
            this.bannerAd = bannerAd;
            bannerAd.onLoad(() => {
                console.log("bannerAd.onLoad", this.bannerAdIsShow);
                (Date.now() - this.enterGameTimestamp > 60000) && this.bannerAdIsShow && this.bannerAd === bannerAd && bannerAd.show();
            });
            bannerAd.onError((res: any) => {
                console.log("bannerAd.onError", res.msg);
                !this.bannerAdIsShow && bannerAd.hide();
            });
            bannerAd.onResize((res: any) => {
                let adWidth: number = res.width;
                let adHeight: number = res.height;
                console.log("bannerAd.onResize", adWidth, adHeight);
                let left: number = (screenWidth - adWidth) / 2;
                let top: number = screenHeight - adHeight;
                bannerAd.style.top = top;
                bannerAd.style.left = left;
            });
        } else {
            (Date.now() - this.enterGameTimestamp > 60000) && this.bannerAd.show();
        }
        callback && callback(null);
    }
    public hideBannerAd(pos: string = "default", callback?: (error: any) => void): void {
        console.log("hideBannerAd");
        this.bannerAdIsShow = false;
        this.bannerAd && this.bannerAd.hide();
        callback && callback(null);
    }
    public showInterstitialAd(pos?: string, callback?: (error: any, isEnd: boolean) => void): void {
        console.log("no showInterstitialAd");
    }
    public traceEvent(event: string): void {
        console.log("no traceEvent");
    }
    public setProcess(process: string): void {
        console.log("no setProcess");
    }
    public getGameRecorder(): GameRecorder {
        return null;
    }
    public getGameNavigator(): GameNavigator {
        return this.gameNavigator;
    }
    public upgradeGame(url: string): void {
        console.log("no upgradeGame");
    }
    /** 非公有方法 */
    public loadNativeAdInfo(callback: (adInfo: NativeAdInfo) => void) {
        if (!this.nativeAd) {
            let nativeAd = qg.createNativeAd({
                adUnitId: "",
            });
            this.nativeAd = nativeAd;

            nativeAd.onError((res: any) => {
                console.log("nativeAd.onError", res.msg);
            });
        }
        this.nativeAd.offLoad();
        this.nativeAd.onLoad((res: any) => {
            console.log("nativeAd.onLoad", res.adList);
            callback && callback(res.adList ? res.adList[0] : null);
        });
        this.nativeAd.load();
    }
    public showNativeAd(adId: string) {
        if (!this.nativeAd) {
            return;
        }
        this.nativeAd.reportAdShow({
            adId: adId
        });
    }
    public clickNativeAd(adId: string) {
        if (!this.nativeAd) {
            return;
        }
        this.nativeAd.reportAdClick({
            adId: adId
        });
    }
}