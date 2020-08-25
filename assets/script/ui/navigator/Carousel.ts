import { _decorator, Node, Event, Component, LabelComponent } from 'cc';
import Conveyer from '../navigator/Conveyer';
import PanelManager from '../../runtime/PanelManager';
import MorePanel from '../panel/MorePanel';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("navigator/Carousel")
export default class Carousel extends Component {

    @property(Conveyer)
    private conveyer: Conveyer = null;

    @property({ displayName: "位置" })
    public pos: string = "";

    private isInited: boolean = false;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.init();
    }

    public open() {
        console.log("Carousel.open()");
        this.node.active = true;
        this.loadGameAd(this.pos);
    }

    public close() {
        console.log("Carousel.close()");
        this.node.active = false;
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
        this.init();
        if (pos) {
            this.conveyer.pos = this.pos = pos;
        }
        this.node.off("game_ad_loaded", this.onGameAdLoaded, this);
        this.node.once("game_ad_loaded", this.onGameAdLoaded, this);
        this.conveyer.loadGameAd();
    }

    private onGameAdLoaded(event: Event) {
        event.propagationStopped = true;
    }

}

