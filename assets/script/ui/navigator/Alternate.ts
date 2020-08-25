import { _decorator, Component, Node, Event, tween, v3 } from "cc";
import { getPlatformApi, GameAd } from "../../platform/PlatformApi";
import Icon from "./Icon";
import PanelManager from "../../runtime/PanelManager";
import MorePanel from "../panel/MorePanel";
const { ccclass, property, menu } = _decorator;

@ccclass("Alternate")
@menu("navigator/Alternate")
export default class Alternate extends Component {

    @property({ displayName: "位置" })
    public pos: string = "";

    @property({ displayName: "显示标题" })
    public showTitle: boolean = true;

    @property({ displayName: "图标列表", type: Icon })
    public iconList: Icon[] = [];

    private isInited: boolean = false;
    private originGameAdList: GameAd[] = [];
    private leftGameAdList: GameAd[] = [];

    onLoad() {
        this.init();
    }
    private init() {
        if (!this.isInited) {
            this.isInited = true;

            this.bindEvents();
        }
    }
    private bindEvents() {
        this.node.on("icon_tap_fail", (event: Event) => {
            PanelManager.instance.openPanel(MorePanel);
            event.propagationStopped = true;
        });
    }
    public loadGameAd(pos?: string) {
        if (pos) this.pos = pos;
        getPlatformApi().getGameNavigator().getGameAd(this.pos, -1, (error, list) => {
            if (!error) {
                this.setData(this.pos, list);
            }
        });
    }
    private setData(pos: string, gameAdList: GameAd[]) {
        this.init();
        this.pos = pos;
        this.originGameAdList = gameAdList;
        this.leftGameAdList = [];
        this.unschedule(this.changeIcons);
        this.changeIcons();
        this.schedule(this.changeIcons, 5, cc.macro.REPEAT_FOREVER);
    }
    private changeIcons() {
        for (let icon of this.iconList) {
            tween(icon.node).set({ scale: v3(1, 1, 1) }).to(0.25, { scale: v3(0, 0, 0) }).call(() => {
                let gameAd = this.getNextGameAd();
                gameAd && icon.setData(this.pos, gameAd, this.showTitle);
            }).to(0.25, { scale: v3(1, 1, 1) }).start();
            //tween(icon.node).set({ eulerAngles: -10 }).repeat(5, cc.tween(icon.node).to(0.5, { eulerAngles: 10 }).to(0.5, { eulerAngles: -10 })).start();
        }
    }
    private getNextGameAd() {
        if (!this.leftGameAdList.length) {
            this.leftGameAdList = this.originGameAdList.slice();
        }
        return this.leftGameAdList.shift();
    }

}
