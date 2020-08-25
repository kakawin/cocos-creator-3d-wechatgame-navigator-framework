import { PlatformApi, GameRecorder, PlatformType, GameNavigator, GameAd } from "./PlatformApi";
import Global from "../data/Global";

const tt: any = window["tt"];
const wxsdk: any = window["wxsdk"];

class BytedanceGameRecorder implements GameRecorder {
    private manager: any;
    private videoPath: string;
    private recording: boolean = false;
    private onStopCallback: (error: any, video?: any) => void;
    constructor() {
        this.manager = tt.getGameRecorderManager();
        this.manager.onInterruptionBegin(() => {
            this.pause();
        });
        this.manager.onInterruptionEnd(() => {
            this.resume();
        });
        this.manager.onStop((res: any) => {
            console.log("BytedanceGameRecorder onStop", res);
            this.videoPath = res.videoPath;
            if (this.recording) return;
            if (this.onStopCallback) {
                this.onStopCallback(null, this.videoPath);
                this.onStopCallback = null;
            }
        });
        this.manager.onError((res: any) => {
            console.log("BytedanceGameRecorder onError", res);
            if (this.recording) {
                this.recording = false;
                if (this.onStopCallback) {
                    this.onStopCallback(new Error(res.errMsg));
                    this.onStopCallback = null;
                }
            }
        });
    }

    public isRecording(): boolean {
        return this.recording;
    }

    public share(pos: string, callback?: (error: any, isFailed: boolean) => void): void {
        console.log("BytedanceGameRecorder share", pos);
        tt.shareAppMessage({
            channel: "video",
            title: "",
            imageUrl: "",
            query: "",
            extra: {
                videoPath: this.videoPath,
                videoTopics: [],
            },
            success: () => {
                console.log("GameRecorder share success");
                callback && callback(null, false);
            },
            fail: (error: any) => {
                console.log("GameRecorder share fail", error.errMsg);
                let isFailed = error.errMsg.indexOf("cancel") >= 0;
                callback && callback(isFailed ? null : new Error(error.errMsg), isFailed);
            },
        });
    }

    public start(duration: number): void {
        console.log("BytedanceGameRecorder start");
        this.recording = true;
        this.videoPath = null;
        this.manager.start({ duration: Math.max(3, Math.min(duration, 300)) });
    }

    public pause(): void {
        console.log("BytedanceGameRecorder pause");
        this.manager.pause();
    }

    public resume(): void {
        console.log("BytedanceGameRecorder resume");
        this.manager.resume();
    }

    public stop(callback?: ((error: any, video?: any) => void)): void {
        console.log("BytedanceGameRecorder stop");
        this.onStopCallback = callback;
        if (this.recording) {
            this.recording = false;
            this.manager.stop();
        } else if (this.videoPath && this.onStopCallback) {
            this.onStopCallback(null, this.videoPath);
            this.onStopCallback = null;
        }
    }
}

export default class BytedanceApi implements PlatformApi {
    public platform: PlatformType = PlatformType.tt;
    private inInited: boolean = false;
    private isLogined: boolean = false;
    private loginCallbackList: Function[] = [];
    private gameRecorder: GameRecorder;
    private nextTick(callback: Function): void {
        setTimeout(() => {
            callback && callback();
        });
    }
    constructor() {
        console.log("BytedanceApi", wxsdk);
        this.gameRecorder = new BytedanceGameRecorder();
    }
    public init(): void {
        if (!this.inInited) {
            this.inInited = true;

            tt.showShareMenu({ withShareTicket: true });
            tt.onShareAppMessage(() => {
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
        tt.showLoading({ title: "登录中", mask: true });
        wxsdk.onLoginComplete(() => {
            if (wxsdk.getLoginStatus() === "success") {
                tt.hideLoading();
                callback && callback(null, wxsdk.conf, wxsdk.data, wxsdk.user);
                this.isLogined = true;
                this.onLogined();
            } else if (wxsdk.getLoginStatus() === "fail") {
                tt.hideLoading();
                tt.showModal({
                    title: "登陆失败",
                    content: "请允许授权",
                    confirmText: "重新登陆",
                    cancelText: "关闭",
                    success: (res: any) => {
                        if (res && res.confirm) {
                            tt.showLoading({ title: "登录中", mask: true });
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
        tt.showModal(option);
    }
    public loadSubpackage(name: string, callback?: (error: any) => void, onProgress?: (progress: number) => void): void {
        if (tt.loadSubpackage && name) {
            let task = tt.loadSubpackage({
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
            console.log("no tt.loadSubpackage");
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
        if (tt.createRewardedVideoAd) {
            wxsdk.createVideo({
                pos: pos,
                success: (res: any) => {
                    callback && callback(null, (res && res.isEnded) || res === undefined);
                },
                fail: (error: any) => {
                    callback && callback(error || new Error("showRewardedVideoAd fail"), false);
                },
            });
        } else {
            console.log("no tt.createRewardedVideoAd");
            callback && this.nextTick(() => {
                callback(new Error("showRewardedVideoAd fail"), true);
            });
        }
    }
    public showBannerAd(pos?: string, callback?: (error: any) => void): void {
        wxsdk.createBanner({ pos });
        callback && callback(null);
    }
    public hideBannerAd(pos?: string, callback?: (error: any) => void): void {
        wxsdk.closeBanner(pos);
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
        return this.gameRecorder;
    }
    public getGameNavigator(): GameNavigator {
        return null;
    }
    public upgradeGame(url: string): void {

    }
}