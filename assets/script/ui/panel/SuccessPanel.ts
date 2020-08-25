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

@ccclass("SuccessPanel")
@menu("ui/panel/SuccessPanel")
export default class SuccessPanel extends BasePanel {

    @property({ displayName: "首页", type: Node })
    public homeButtonNode: Node = null;
    @property({ displayName: "下关", type: Node })
    public nextButtonNode: Node = null;
    @property(Alternate)
    private alternate: Alternate = null;

    private isInited: boolean = false;

    onLoad() {
        console.log("SuccessPanel.onLoad()");
        this.init();
    }

    protected onOpen() {
        console.log("SuccessPanel.onOpen()");
        DataManager.getGameData().level++;
        DataManager.saveGameData();

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
        console.log("SuccessPanel.onClose()");
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
        this.nextButtonNode.on(Node.EventType.TOUCH_END, () => {
            AudioManager.instance.playAudioClick();
            PanelManager.instance.closePanel(SuccessPanel);
            PanelManager.instance.openPanel(ControlPanel);
            GameControl.instance.loadScene(DataManager.getGameData().level);
        });
    }
}
