import { _decorator, Event } from 'cc';
import BasePanel from "./BasePanel";
import { getPlatformApi, GameAd } from '../../platform/PlatformApi';
import PanelManager from '../../runtime/PanelManager';
import Shock from '../navigator/More';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("ui/panel/ShockPanel")
export default class ShockPanel extends BasePanel {

    @property(Shock)
    private shock: Shock = null;

    private isInited: boolean = false;
    private closeCallback: Function = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.init();
    }

    protected onOpen(closeCallback?: Function) {
        console.log("ShockPanel.onOpen()");
        this.closeCallback = closeCallback;
        getPlatformApi().hideBannerAd();
        this.shock.open(() => {
            getPlatformApi().showBannerAd();
            PanelManager.instance.closePanel(ShockPanel);
        });
    }

    protected onClose() {
        console.log("ShockPanel.onClose()");
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

