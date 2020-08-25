import { _decorator, Node, Event, Component, LabelComponent } from 'cc';
import Conveyer from './Conveyer';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("navigator/Shock")
export default class Shock extends Component {

    @property({ displayName: "关闭", type: Node })
    private closeButtonNode: Node = null;

    @property(Conveyer)
    private conveyer: Conveyer = null;

    private isInited: boolean = false;
    private closeCallback: Function = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.init();
    }

    public open(closeCallback?: Function) {
        console.log("Shock.open()");
        this.closeCallback = closeCallback;
        this.node.active = true;
        this.loadGameAd();
    }

    public close() {
        console.log("Shock.close()");
        this.node.active = false;
        this.closeCallback && this.closeCallback();
    }

    private init() {
        if (!this.isInited) {
            this.isInited = true;

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.closeButtonNode.on(Node.EventType.TOUCH_END, () => {
            this.close();
        });
    }

    public loadGameAd(pos?: string) {
        this.init();
        this.node.off("game_ad_loaded", this.onGameAdLoaded, this);
        this.node.once("game_ad_loaded", this.onGameAdLoaded, this);
        this.conveyer.loadGameAd();
    }

    private onGameAdLoaded(event: Event) {
        event.propagationStopped = true;
    }

}

