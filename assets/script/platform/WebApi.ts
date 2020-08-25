import { PlatformApi, GameRecorder, PlatformType, GameNavigator } from "./PlatformApi";

export default class WebApi implements PlatformApi {
    public platform: PlatformType = PlatformType.web;
    private inInited: boolean = false;
    private isLogined: boolean = false;
    private loginCallbackList: Function[] = [];
    private nextTick(callback: Function): void {
        setTimeout(() => {
            callback && callback();
        });
    }
    constructor() {
        console.log("WebApi");
    }
    public init(): void {
        if (!this.inInited) {
            this.inInited = true;
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
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            sdkPlugin.onAdPosition("login");
            callback(null, null, this.getGameData(), null);
        } else {
            console.log("no login");
            callback && this.nextTick(() => {
                callback(null, null, this.getGameData(), null);
                this.isLogined = true;
                this.onLogined();
            });
        }
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
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            console.log("sdkPlugin onShow: ");
            sdkPlugin.onShow(callback);
        } else {
            console.log("no onShow");
        }
    }
    public onHide(callback: (res: any) => void): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            console.log("sdkPlugin onHide: ");
            sdkPlugin.onHide(callback);
        } else {
            console.log("no onHide");
        }
    }
    public showModal(option: { title?: string, content?: string, confirmText?: string, showCancel?: boolean, cancelText?: string }, callback?: (error: any, confirm: boolean) => void): void {
        this.nextTick(() => {
            if (option.showCancel && window.confirm) {
                let confirm = window.confirm(option.content);
                callback && callback(null, confirm);
            }
            if (!option.showCancel && window.alert) {
                window.alert(option.content);
                callback && callback(null, true);
            }
        });
    }
    public loadSubpackage(name: string, callback?: (error: any) => void): void {
        console.log("no loadSubpackage");
        callback && this.nextTick(() => {
            callback(null);
        });
    }
    public share(pos: string, callback?: (error: any, isFailed: boolean) => void): void {
        console.log("no share");
        callback && this.nextTick(() => {
            callback(null, false);
        });
    }
    public showRewardedVideoAd(pos?: string, callback?: (error: any, isEnded: boolean) => void): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            console.log("sdkPlugin showRewardedVideoAd: ", pos);
            sdkPlugin.onAdPosition("showVideoAd", callback);
        } else {
            console.log("no showRewardedVideoAd");
            callback && this.nextTick(() => {
                callback(null, true);
            });
        }
    }
    public showBannerAd(pos?: string, callback?: (error: any) => void): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            console.log("sdkPlugin showBannerAd: ", pos);
            sdkPlugin.onAdPosition("showBannerAd", callback);
        } else {
            console.log("no showBannerAd");
            callback && this.nextTick(() => {
                callback(null);
            });
        }
    }
    public hideBannerAd(pos?: string, callback?: (error: any) => void): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            console.log("sdkPlugin hideBannerAd: ", pos);
            sdkPlugin.onAdPosition("hideBannerAd", callback);
        } else {
            console.log("no hideBannerAd");
            callback && this.nextTick(() => {
                callback(null);
            });
        }
    }
    public showInterstitialAd(pos?: string, callback?: (error: any, isEnd: boolean) => void): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            console.log("sdkPlugin showInterstitialAd: ", pos);
            sdkPlugin.onAdPosition("showInterAd", callback);
        } else {
            console.log("no showInterstitialAd");
            callback && this.nextTick(() => {
                callback(null, true);
            });
        }
    }
    public traceEvent(event: string): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            try {
                sdkPlugin.postMessage("traceEvent", event);
                console.log("sdkPlugin traceEvent: ", event);
            } catch (error) { console.error("sdkPlugin traceEvent error: ", error); }
        } else {
            console.log("no traceEvent");
        }
    }
    public setProcess(process: string): void {
        console.log("no setProcess");
    }
    public getGameRecorder(): GameRecorder {
        return null;
    }
    public getGameNavigator(): GameNavigator {
        return null;
    }
    public upgradeGame(url: string): void {
        let sdkPlugin = window["sdkPlugin"];
        if (sdkPlugin) {
            try {
                sdkPlugin.postMessage("upgradeGame", url);
                console.log("sdkPlugin upgradeGame: ", url);
            } catch (error) { console.error("sdkPlugin upgradeGame error: ", error); }
        } else {
            console.log("no upgradeGame");
        }
    }
}