import { _decorator, Node, Event } from 'cc';
import BasePanel from "./BasePanel";
import { getPlatformApi, GameAd } from '../../platform/PlatformApi';
import PanelManager from '../../runtime/PanelManager';
import Hot from '../navigator/Hot';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("ui/panel/HotPanel")
export default class HotPanel extends BasePanel {

    @property(Hot)
    private hot: Hot = null;

    private isInited: boolean = false;
    private closeCallback: Function = null;

    onLoad() {
        this.init();
    }

    protected onOpen(closeCallback?: Function) {
        console.log("HotPanel.onOpen()");
        this.closeCallback = closeCallback;
        getPlatformApi().hideBannerAd();
        this.hot.open(() => {
            PanelManager.instance.closePanel(HotPanel);
        });
    }

    protected onClose() {
        console.log("HotPanel.onClose()");
        this.closeCallback && this.closeCallback();
    }

    protected init() {
        if (!this.isInited) {
            this.isInited = true;

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.node.on("icon_tap_fail", (event: Event) => {
            event.propagationStopped = true;
        });
    }

}

