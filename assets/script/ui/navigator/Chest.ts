import { _decorator, Component, Node, ProgressBarComponent, tween, v3 } from 'cc';
import { getPlatformApi } from '../../platform/PlatformApi';
import PanelManager from '../../runtime/PanelManager';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu("navigator/Chest")
export default class Chest extends Component {

    @property({ displayName: "光", type: Node })
    public light: Node = null;
    @property({ displayName: "提示", type: Node })
    public tips: Node = null;

    @property({ displayName: "进度条", type: ProgressBarComponent })
    public progressBar: ProgressBarComponent = null;

    @property({ displayName: "打开", type: Node })
    public openButtonNode: Node = null;

    private isInited: boolean = false;

    private progress: number = 0;
    private increase: number = 0;
    private isFull: boolean = false;
    private closeCallback: Function = null;

    onLoad() {
        console.log("Chest.onLoad()");
        this.init();
    }

    public open(closeCallback?: Function) {
        console.log("Chest.onOpen()");
        this.node.active = true;

        this.closeCallback = closeCallback;

        this.progress = 0;
        this.increase = 0;
        this.isFull = false;

        getPlatformApi().hideBannerAd();
    }

    public close() {
        console.log("Chest.onClose()");

        this.progress = 0;
        this.increase = 0;
        this.isFull = false;

        this.node.active = false;
        this.closeCallback && this.closeCallback();
    }

    protected init() {
        if (!this.isInited) {
            this.isInited = true;
            tween(this.light).by(1, { eulerAngles: v3(0, 0, -90) }).repeatForever().start();
            tween(this.tips).set({ scale: v3(1, 1, 1) }).delay(0.2).set({ scale: v3(0, 0, 0) }).delay(0.2).union().repeatForever().start();

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.openButtonNode.on(Node.EventType.TOUCH_END, () => {
            if (!this.isFull && this.progress >= 60) {
                this.isFull = true;
                getPlatformApi().showBannerAd();
                this.scheduleOnce(() => {
                    this.close();
                }, 1.5);
            }
            this.increase += 30;
        });
    }

    update() {
        if (this.increase > 0) {
            if (this.increase >= 3) {
                this.increase -= 3;
                this.progress += 3;
            } else {
                this.increase = 0;
                this.progress += this.increase;
            }
        }

        if (!this.isFull && this.progress > 0) {
            this.progress -= 0.8;
        }

        if (this.progress < 0) {
            this.progress = 0;
        } else if (this.progress > 100) {
            this.progress = 100;
        }

        this.progressBar.progress = this.progress / 100;
    }

}

