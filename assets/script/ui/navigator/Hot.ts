import { _decorator, Node, Event, Component, LabelComponent } from 'cc';
import { GameAd } from '../../platform/PlatformApi';
import Icon from '../navigator/Icon';
import Conveyer from '../navigator/Conveyer';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("navigator/Hot")
export default class Hot extends Component {

    @property({ displayName: "关闭", type: Node })
    private closeButtonNode: Node = null;

    @property(Conveyer)
    private conveyer: Conveyer = null;

    @property(Icon)
    private headIconList: Icon[] = [];

    private isInited: boolean = false;
    private closeCallback: Function = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.init();
    }

    public open(closeCallback?: Function) {
        console.log("Hot.open()");
        this.closeCallback = closeCallback;
        this.node.active = true;
        this.loadGameAd();
    }

    public close() {
        console.log("Hot.close()");
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

    public loadGameAd() {
        this.init();
        this.node.off("game_ad_loaded", this.onGameAdLoaded, this);
        this.node.once("game_ad_loaded", this.onGameAdLoaded, this);
        this.conveyer.loadGameAd();
    }

    private onGameAdLoaded(event: Event) {
        this.setData(this.conveyer.pos, this.conveyer.gameAdList);
        event.propagationStopped = true;
    }

    private setData(pos: string, gameAdList: GameAd[]) {
        this.headIconList.forEach((icon, index) => {
            let gameAd = gameAdList[index];
            if (gameAd) {
                icon.node.active = true;
                icon.setData(pos, gameAd, true);
            } else {
                icon.node.active = false;
            }
        });

        let descLabelList: LabelComponent[] = [];
        let rand = 0;
        let num = 1;
        for (let iconNode of this.conveyer.scrollView.content.children) {
            iconNode.getChildByName("num").getComponent(LabelComponent).string = "" + num++;
            descLabelList.push(iconNode.getChildByName("desc").getComponent(LabelComponent));
        }
        while (descLabelList.length) {
            rand += Math.round(Math.random() * 10);
            descLabelList.pop().string = rand + "位好友在玩";
        }
    }

}

