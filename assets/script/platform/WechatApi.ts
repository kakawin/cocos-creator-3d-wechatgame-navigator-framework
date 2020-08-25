import { PlatformApi, GameRecorder, PlatformType, GameNavigator, GameAd } from "./PlatformApi";
import Global from "../data/Global";

const wx: any = window["wx"];
const wxsdk: any = window["wxsdk"];

class WechatGameNavigator implements GameNavigator {
    public getGameAd(pos: string, count: number = -1, callback?: (error: any, list: GameAd[]) => void): void {
        wxsdk.getGameAd({
            pos,
            count,
            success: (res: any) => {
                let list: GameAd[] = res.data || [];
                callback && callback(null, list);
            },
            fail: (res: any) => {
                callback && callback(res || new Error("getGameAd fail"), []);
            },
        });
    }
    public tapGameAd(pos: string, gameAd: GameAd, callback?: (error: any) => void): void {
        wxsdk.tapGameAd({
            pos,
            ad: gameAd,
            redirect: true,
            success: () => {
                callback && callback(null);
            },
            fail: (res: any) => {
                callback && callback(res || new Error("tapGameAd fail"));
            },
        });
    }
}

export default class WechatApi implements PlatformApi {
    public platform: PlatformType = PlatformType.wx;
    private inInited: boolean = false;
    private isLogined: boolean = false;
    private loginCallbackList: Function[] = [];
    private gameNavigator: GameNavigator;
    private nextTick(callback: Function): void {
        setTimeout(() => {
            callback && callback();
        });
    }
    constructor() {
        console.log("WechatApi", wxsdk);
        this.gameNavigator = new WechatGameNavigator();
    }
    public init(): void {
        if (!this.inInited) {
            this.inInited = true;

            wx.showShareMenu({ withShareTicket: true });
            wx.onShareAppMessage(() => {
                let option = wxsdk.createShareOptions({ pos: "ShareAppButton" });
                return {
                    title: option.title,
                    imageUrl: option.imageUrl,
                    query: option.query,
                }
            });
            wxsdk.init({
                version: Global.config.version, // 当前的小游戏版本号，只能以数字
                appid: "", // 此项目在云平台的appid
                secret: "", // 此项目在云平台的secret, 用于与后端通信签名
                share: {
                    title: "", // 默认分享文案
                    image: "", // 默认分享图片
                },
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
        wx.showLoading({ title: "登录中", mask: true });
        wxsdk.onLoginComplete(() => {
            if (wxsdk.getLoginStatus() === "success") {
                wx.hideLoading();
                callback && callback(null, wxsdk.conf, wxsdk.data, wxsdk.user);
                this.isLogined = true;
                this.onLogined();
            } else if (wxsdk.getLoginStatus() === "fail") {
                wx.hideLoading();
                wx.showModal({
                    title: "登陆失败",
                    content: "请允许授权",
                    confirmText: "重新登陆",
                    cancelText: "关闭",
                    success: (res: any) => {
                        if (res && res.confirm) {
                            wx.showLoading({ title: "登录中", mask: true });
                            wxsdk.login();
                        } else {
                            callback && callback(null, null, null, null);
                            this.isLogined = true;
                            this.onLogined();
                        }
                    }
                });
            }
        });
        wxsdk.login();
        this.onLogined(() => {
            wxsdk.initBannerManager();
        });
    }
    public getGameData(): any {
        wxsdk.data;
    }
    public setGameData(data: any, post?: boolean): void {
        wxsdk.setAllData(data, post);
    }
    public onShow(callback: (res: any) => void): void {
        wxsdk.onShow(callback);
    }
    public onHide(callback: (res: any) => void): void {
        wxsdk.onHide(callback);
    }
    public showModal(option: { title?: string, content?: string, confirmText?: string, showCancel?: boolean, cancelText?: string }, callback?: (error: any, confirm: boolean) => void): void {
        let success = (res: { confirm: boolean, cancel: boolean }) => {
            callback && callback(null, res.confirm);
        }
        let fail = (error: any) => {
            callback && callback(error || new Error("showModal fail"), false);
        }
        Object.assign(option, { success, fail });
        wx.showModal(option);
    }
    public loadSubpackage(name: string, callback?: (error: any) => void, onProgress?: (progress: number) => void): void {
        if (wx.loadSubpackage && name) {
            let task = wx.loadSubpackage({
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
        wxsdk.share({
            pos,
            onShareBack: (showRes: any, duration: number) => {
                console.log("share onShareBack", showRes, duration);
                callback && callback(null, duration < 3.5 * 1000);
            },
        });
    }
    public showRewardedVideoAd(pos?: string, callback?: (error: any, isEnded: boolean) => void): void {
        wxsdk.createVideo({
            pos: pos,
            success: (res: any) => {
                callback && callback(null, (res && res.isEnded) || res === undefined);
            },
            fail: (error: any) => {
                callback && callback(error || new Error("showRewardedVideoAd fail"), false);
            },
        });
    }
    public showBannerAd(pos: string = "default", callback?: (error: any) => void): void {
        wxsdk.showBannerAd();
        callback && callback(null);
    }
    public hideBannerAd(pos: string = "default", callback?: (error: any) => void): void {
        wxsdk.hideBannerAd();
        callback && callback(null);
    }
    public showInterstitialAd(pos?: string, callback?: (error: any, isEnd: boolean) => void): void {
        wxsdk.createInterstitialAd({
            pos: pos,
            success: () => {
                callback && callback(null, true);
            },
            fail: (error: any) => {
                callback && callback(error || new Error("showInterstitialAd fail"), true);
            },
        });
    }
    public traceEvent(event: string): void {
        wxsdk.traceEvent(event);
    }
    public setProcess(process: string): void {
        wxsdk.setProcess(process);
    }
    public getGameRecorder(): GameRecorder {
        return null;
    }
    public getGameNavigator(): GameNavigator {
        return this.gameNavigator;
    }
    public upgradeGame(url: string): void {

    }
}