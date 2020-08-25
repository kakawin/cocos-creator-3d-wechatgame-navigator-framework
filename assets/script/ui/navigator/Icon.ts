import { _decorator, Component, Node, SpriteComponent, LabelComponent, BlockInputEventsComponent, macro, Event, tween, v3 } from 'cc';
import { GameAd, getPlatformApi } from '../../platform/PlatformApi';
import { setSpriteFrame } from '../../util/Util';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("navigator/Icon")
export default class Icon extends Component {

    @property(SpriteComponent)
    public image: SpriteComponent = null;

    @property(LabelComponent)
    public title: LabelComponent = null;

    @property(Node)
    public buttonNode: Node = null;

    @property(Node)
    public tips: Node = null;

    @property({ displayName: "闪烁提示" })
    public blinkTips: boolean = true;

    private isInited: boolean = false;
    private pos: string;
    private gameAd: GameAd;

    onLoad() {
        this.init();
    }

    private init() {
        if (!this.isInited) {
            this.isInited = true;

            if (!this.buttonNode) {
                this.buttonNode = this.node;
            }

            this.node.addComponent(BlockInputEventsComponent);

            if (this.tips && this.blinkTips) {
                this.tips.active = true;
                this.showBlinkTips();
                this.schedule(this.showBlinkTips, 1, macro.REPEAT_FOREVER);
            }
            this.bindEvents();
        }
    }

    private showBlinkTips() {
        tween(this.tips).set({ scale: v3(1, 1, 1) }).delay(0.5).set({ scale: v3(0, 0, 0) }).start();
    }

    public setData(pos: string, gameAd: GameAd, showTitle: boolean = false) {
        this.init();
        this.pos = pos;
        this.gameAd = gameAd;
        setSpriteFrame(this.image, gameAd.icon);
        if (this.title) {
            this.title.node.active = showTitle;
            this.title.string = gameAd.title;
        }
    }

    private bindEvents() {
        this.buttonNode.on(Node.EventType.TOUCH_END, () => {
            getPlatformApi().getGameNavigator().tapGameAd(this.pos, this.gameAd, (error) => {
                if (error) this.node.dispatchEvent(new Event("icon_tap_fail", true));
            });
            this.node.dispatchEvent(new Event("icon_tap", true));
        });
    }
}