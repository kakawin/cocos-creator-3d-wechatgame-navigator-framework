import WebApi from "./WebApi";
import WechatApi from "./WechatApi";
import QQApi from "./QQApi";
import BytedanceApi from "./BytedanceApi";
import QuickGameApi from "./QuickGameApi";

export enum PlatformType {
    tt = "tt",
    qq = "qq",
    wx = "wx",
    web = "web",
    qg = "qg",
}

/**
 * 录屏
 */
export interface GameRecorder {
    start(duration: number): void;
    pause(): void;
    resume(): void;
    stop(callback?: ((error: any, video?: any) => void)): void;
    share(pos: string, callback?: (error: any, isFailed: boolean) => void): void;
    isRecording(): boolean;
}

/**
 * 导量图标
 */
export interface GameAd {
    title: string;
    image: string;
    icon: string;
    appid: string;
}

/**
 * 导量
 */
export interface GameNavigator {
    getGameAd(pos: string, count?: number, callback?: (error: any, list: GameAd[]) => void): void;
    tapGameAd(pos: string, gameAd: GameAd, callback?: (error: any) => void): void;
}

export interface PlatformApi {
    platform: PlatformType;
    /**
     * 初始化平台API
     */
    init(): void;
    /**
     * 登录
     * @param callback 
     */
    login(callback?: (error: any, conf: any, data: any, user: any) => void): void;
    /**
     * 登录
     * @param callback 
     */
    onLogined(callback?: Function): void;
    /**
     * 获取游戏数据
     */
    getGameData(): any;
    /**
     * 保存数据
     * @param data 
     * @param post 
     */
    setGameData(data: any, post?: boolean): void;
    /**
     * 页面显示
     * @param callback 
     */
    onShow(callback: (res: any) => void): void;
    /**
     * 页面隐藏
     * @param callback 
     */
    onHide(callback: (res: any) => void): void;
    /**
     * 显示弹窗
     * @param option 
     * @param callback 
     */
    showModal(option: { title?: string, content?: string, confirmText?: string, showCancel?: boolean, cancelText?: string }, callback?: (error: any, confirm: boolean) => void): void;
    /**
     * 加载子包
     * @param name 
     * @param callback 
     */
    loadSubpackage(name: string, callback?: (error: any) => void, onProgress?: (progress: number) => void): void;
    /**
     * 分享
     * @param pos 
     * @param callback 
     */
    share(pos: string, callback?: (error: any, isFailed: boolean) => void): void;
    /**
     * 显示视频广告
     * @param pos 
     * @param callback 
     */
    showRewardedVideoAd(pos?: string, callback?: (error: any, isEnded: boolean) => void): void;
    /**
     * 显示banner广告
     * @param pos 
     * @param callback 
     */
    showBannerAd(pos?: string, callback?: (error: any) => void): void;
    /**
     * 隐藏banner广告
     * @param pos 
     * @param callback 
     */
    hideBannerAd(pos?: string, callback?: (error: any) => void): void;
    /**
     * 显示插屏广告
     * @param pos 
     * @param callback 
     */
    showInterstitialAd(pos?: string, callback?: (error: any, isEnd: boolean) => void): void;
    /**
     * 事件埋点
     * @param event 
     */
    traceEvent(event: string): void;
    /**
     * 关卡进度
     * @param process 
     */
    setProcess(process: string): void;
    /**
     * 录屏
     */
    getGameRecorder(): GameRecorder;
    /**
     * 导量
     */
    getGameNavigator(): GameNavigator;
    /**
     * 更新游戏
     */
    upgradeGame(url: string): void;
}

let api: PlatformApi = null;
export const getPlatformApi = (): PlatformApi => {
    if (!api) {
        if (window["qg"]) {
            api = new QuickGameApi();
        } else if (window["tt"]) {
            api = new BytedanceApi();
        } else if (window["qq"]) {
            api = new QQApi();
        } else if (window["wx"]) {
            api = new WechatApi()
        } else {
            api = new WebApi();
        }
    }
    return api;
}