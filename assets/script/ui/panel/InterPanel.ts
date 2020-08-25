import { _decorator, Event, Node } from 'cc';
import BasePanel from "./BasePanel";
import { getPlatformApi, GameAd } from '../../platform/PlatformApi';
import Alternate from '../navigator/Alternate';
import PanelManager from '../../runtime/PanelManager';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("ui/panel/InterPanel")
export default class InterPanel extends BasePanel {

    @property({ displayName: "关闭", type: Node })
    public closeButtonNode: Node = null;

    @property(Alternate)
    private alternate: Alternate = null;

    private isInited: boolean = false;
    private closeCallback: Function = null;
    
    onLoad() {
        this.init();
    }

    protected onOpen(closeCallback?: Function) {
        console.log("InterPanel.onOpen()");
        this.closeCallback = closeCallback;
        getPlatformApi().showBannerAd();
        this.alternate.loadGameAd();
    }

    protected onClose() {
        console.log("InterPanel.onClose()");
        this.closeCallback && this.closeCallback();
    }

    protected init() {
        if (!this.isInited) {
            this.isInited = true;

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.closeButtonNode.on(Node.EventType.TOUCH_END, () => {
            PanelManager.instance.closePanel(InterPanel);
        });
        this.node.on("icon_tap_fail", (event: Event) => {
            event.propagationStopped = true;
        });
    }

}

