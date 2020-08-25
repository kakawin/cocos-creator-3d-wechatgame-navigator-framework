import { _decorator, Component } from 'cc';
import BasePanel from '../ui/panel/BasePanel';
const { ccclass, property, menu } = _decorator;

@ccclass("PanelManager")
@menu("runtime/PanelManager")
export default class PanelManager extends Component {
    public static instance: PanelManager;
    // LIFE-CYCLE CALLBACKS:
    @property({ displayName: "页面列表", type: BasePanel })
    public panelList: BasePanel[] = [];

    private panelMap: { [classname: string]: BasePanel } = {};
    private isInited: boolean = false;

    onLoad() {
        console.log("PanelManager.onLoad()");
        PanelManager.instance = this;
        this.init();
    }

    // start () {}

    // update (dt) {}

    private init() {
        if (!this.isInited) {
            this.isInited = true;

            this.panelList = this.node.getComponentsInChildren(BasePanel);
            for (let panel of this.panelList) {
                this.panelMap[panel["__classname__"]] = panel;
            }
        }
    }

    public openPanel<T extends BasePanel>(type: { prototype: T }, param?: any) {
        let panel = this.getPanelInstance(type);
        if (panel) {
            panel.open(param);
        } else {
            console.error("panel not found: ", type);
        }
    }

    public closePanel<T extends BasePanel>(type: { prototype: T }, param?: any) {
        let panel = this.getPanelInstance(type);
        if (panel) {
            panel.close(param);
        } else {
            console.error("panel not found: ", type);
        }
    }

    public closeAllPanel() {
        for (let key of Object.keys(this.panelMap)) {
            let panel = this.panelMap[key];
            panel.isOpened && panel.close();
        }
    }

    public getPanelInstance<T extends BasePanel>(type: { prototype: T }): T {
        let classname = type.prototype["__classname__"];
        return this.panelMap[classname] as T;
    }
}
