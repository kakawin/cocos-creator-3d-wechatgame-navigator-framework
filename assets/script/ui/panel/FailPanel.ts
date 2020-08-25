import { _decorator, Component, Node, ButtonComponent } from 'cc';
import BasePanel from './BasePanel';
import PanelManager from '../../runtime/PanelManager';
import HomePanel from './HomePanel';
import GameControl from '../../runtime/GameControl';
import DataManager from '../../data/DataManager';
import AudioManager from '../../runtime/AudioManager';
import { getPlatformApi } from '../../platform/PlatformApi';
import ControlPanel from './ControlPanel';
import Alternate from '../navigator/Alternate';
import MorePanel from './MorePanel';
const { ccclass, property, menu } = _decorator;

@ccclass("FailPanel")
@menu("ui/panel/FailPanel")
export default class FailPanel extends BasePanel {

    @property({ displayName: "首页", type: Node })
    public homeButtonNode: Node = null;
    @property({ displayName: "重来", type: Node })
    public restartButtonNode: Node = null;
    @property(Alternate)
    private alternate: Alternate = null;

    private isInited: boolean = false;

    onLoad() {
        console.log("FailPanel.onLoad()");
        this.init();
    }

    protected onOpen() {
        console.log("FailPanel.onOpen()");
        const platformApi = getPlatformApi();
        if (platformApi.getGameNavigator() && DataManager.getConfig().allow_navigator) {
            this.alternate.node.active = true;
            this.alternate.loadGameAd();
            PanelManager.instance.openPanel(MorePanel);
        } else {
            this.alternate.node.active = false;
            getPlatformApi().showBannerAd();
        }
    }

    protected onClose() {
        console.log("FailPanel.onClose()");
        getPlatformApi().hideBannerAd();
    }

    protected init() {
        if (!this.isInited) {
            this.isInited = true;

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.homeButtonNode.on(Node.EventType.TOUCH_END, () => {
            AudioManager.instance.playAudioClick();
            PanelManager.instance.closeAllPanel();
            PanelManager.instance.openPanel(HomePanel);
        });
        this.restartButtonNode.on(Node.EventType.TOUCH_END, () => {
            AudioManager.instance.playAudioClick();
            PanelManager.instance.closePanel(FailPanel);
            PanelManager.instance.openPanel(ControlPanel);
            GameControl.instance.loadScene(DataManager.getGameData().level, true);
        });
    }
}
