import { _decorator, Event } from 'cc';
import BasePanel from "./BasePanel";
import { getPlatformApi, GameAd } from '../../platform/PlatformApi';
import PanelManager from '../../runtime/PanelManager';
import More from '../navigator/More';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("ui/panel/MorePanel")
export default class MorePanel extends BasePanel {

    @property(More)
    private more: More = null;

    private isInited: boolean = false;
    private closeCallback: Function = null;

    onLoad() {
        this.init();
    }

    protected onOpen(closeCallback?: Function) {
        console.log("MorePanel.onOpen()");
        this.closeCallback = closeCallback;
        getPlatformApi().hideBannerAd();
        this.more.open(() => {
            getPlatformApi().showBannerAd();
            PanelManager.instance.closePanel(MorePanel);
        });
    }

    protected onClose() {
        console.log("MorePanel.onClose()");
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

