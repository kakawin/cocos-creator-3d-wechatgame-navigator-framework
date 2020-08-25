import { _decorator, Component, Node, ProgressBarComponent, tween, v3 } from 'cc';
import BasePanel from "./BasePanel";
import PanelManager from '../../runtime/PanelManager';
import Chest from '../navigator/Chest';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("ui/panel/ChestPanel")
export default class ChestPanel extends BasePanel {

    @property(Chest)
    private chest: Chest = null;

    private isInited: boolean = false;

    private closeCallback: Function = null;

    onLoad() {
        console.log("ChestPanel.onLoad()");
        this.init();
    }

    protected onOpen(closeCallback?: Function) {
        console.log("ChestPanel.onOpen()");
        this.closeCallback = closeCallback;

        this.chest.open(() => {
            PanelManager.instance.closePanel(ChestPanel);
        });
    }

    protected onClose() {
        console.log("ChestPanel.onClose()");

        this.closeCallback && this.closeCallback();
    }

    protected init() {
        if (!this.isInited) {
            this.isInited = true;

            this.bindEvents();
        }
    }

    private bindEvents() {
    }

}

