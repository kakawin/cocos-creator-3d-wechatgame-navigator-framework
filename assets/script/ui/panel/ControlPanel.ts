import { _decorator, Node, UITransformComponent } from 'cc';
import BasePanel from './BasePanel';
import PanelManager from '../../runtime/PanelManager';
import HomePanel from './HomePanel';
import GameControl from '../../runtime/GameControl';
import DataManager from '../../data/DataManager';
import AudioManager from '../../runtime/AudioManager';
import { getPlatformApi } from '../../platform/PlatformApi';
import Carousel from '../navigator/Carousel';
const { ccclass, property, menu } = _decorator;

@ccclass("ControlPanel")
@menu("ui/panel/ControlPanel")
export default class ControlPanel extends BasePanel {

    @property({ displayName: "主页", type: Node })
    public homeButtonNode: Node = null;
    @property({ displayName: "重来", type: Node })
    public restartButtonNode: Node = null;

    @property(UITransformComponent)
    public uiTransform: UITransformComponent = null;

    @property({ displayName: "走马灯", type: Carousel })
    public carousel: Carousel = null;

    private isInited: boolean = false;

    onLoad() {
        console.log("ControlPanel.onLoad()");
        this.init();
    }

    protected onOpen() {
        console.log("ControlPanel.onOpen()");
        const platformApi = getPlatformApi();
        platformApi.showBannerAd();
    }

    protected onClose() {
        console.log("ControlPanel.onClose()");
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
            PanelManager.instance.openPanel(HomePanel);
        });
        this.restartButtonNode.on(Node.EventType.TOUCH_END, () => {
            AudioManager.instance.playAudioClick();
            GameControl.instance.loadScene(DataManager.getGameData().level, true);
        });
    }
}
