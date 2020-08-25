import { _decorator, Component, Node } from 'cc';
import BasePanel from './BasePanel';
import PanelManager from '../../runtime/PanelManager';
import ControlPanel from './ControlPanel';
import GameControl from '../../runtime/GameControl';
import DataManager from '../../data/DataManager';
import AudioManager from '../../runtime/AudioManager';
import { getPlatformApi, PlatformType } from '../../platform/PlatformApi';
import HotPanel from './HotPanel';
import Carousel from '../navigator/Carousel';
import ShockPanel from './ShockPanel';
const { ccclass, property, menu } = _decorator;

@ccclass("HomePanel")
@menu("ui/panel/HomePanel")
export default class HomePanel extends BasePanel {

    @property({ displayName: "开始", type: Node })
    public startButtonNode: Node = null;
    @property({ displayName: "劲爆游戏", type: Node })
    public shockButtonNode: Node = null;
    @property({ displayName: "走马灯", type: Carousel })
    public carousel: Carousel = null;

    private isInited: boolean = false;

    onLoad() {
        console.log("HomePanel.onLoad()");
        this.init();
        this.isOpened = true;
        const platformApi = getPlatformApi();
        platformApi.onLogined(() => {
            if (platformApi.getGameNavigator() && DataManager.getConfig().allow_navigator) {
                PanelManager.instance.openPanel(HotPanel, () => {
                    getPlatformApi().showBannerAd();
                });
                this.carousel.open();
                this.shockButtonNode.active = true;
            }
        });
    }

    protected onOpen() {
        console.log("HomePanel.onOpen()");
        AudioManager.instance.playMusicGameBackground();
        const platformApi = getPlatformApi();
        platformApi.showBannerAd();
        platformApi.onLogined(() => {
            if (platformApi.getGameNavigator() && DataManager.getConfig().allow_navigator) {
                this.carousel.open();
            }
        });
    }

    protected onClose() {
        console.log("HomePanel.onClose()");
        getPlatformApi().hideBannerAd();
    }

    protected init() {
        if (!this.isInited) {
            this.isInited = true;

            getPlatformApi().showBannerAd();

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.shockButtonNode.on(Node.EventType.TOUCH_END, () => {
            AudioManager.instance.playAudioClick();
            PanelManager.instance.openPanel(ShockPanel);
        });
        this.startButtonNode.on(Node.EventType.TOUCH_END, () => {
            AudioManager.instance.playAudioClick();
            PanelManager.instance.closeAllPanel();
            PanelManager.instance.openPanel(ControlPanel);
            GameControl.instance.loadScene(DataManager.getGameData().level);
        });
    }
}
