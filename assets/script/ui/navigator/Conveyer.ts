import Icon from "./Icon";
import { ScrollViewComponent, _decorator, Component, LayoutComponent, Node, instantiate, Event } from "cc";
import { GameAd, getPlatformApi } from "../../platform/PlatformApi";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("navigator/Conveyer")
export default class Conveyer extends Component {

    @property(ScrollViewComponent)
    public scrollView: ScrollViewComponent = null;

    @property(Node)
    public viewMaskNode: Node = null;

    @property(Node)
    public iconPrefab: Node = null;

    @property({ displayName: "位置" })
    public pos: string = "";

    @property({ displayName: "显示标题" })
    public showTitle: boolean = true;

    @property({ displayName: "一行完全展示秒数" })
    public oneRowTime: number = 3;

    private isInited: boolean = false;
    private isVertical: boolean = false;
    private isScrollingToEnd: boolean = true;
    private pageSize: number = 0;
    private oneRowLimit: number = 0;
    private content: Node = null;
    private contentLayout: LayoutComponent = null;
    public gameAdList: GameAd[] = [];

    onLoad() {
        this.init();
    }

    private init() {
        if (!this.isInited) {
            this.isInited = true;

            this.isVertical = !!this.scrollView.vertical;
            this.content = this.scrollView.content;
            this.contentLayout = this.content.getComponent(LayoutComponent);
            if (this.isVertical) {
                this.oneRowLimit = Math.floor((this.content.width - this.contentLayout.paddingLeft - this.contentLayout.paddingRight) / this.iconPrefab.width);
                this.pageSize = Math.floor((this.viewMaskNode.height - this.contentLayout.paddingTop - this.contentLayout.paddingBottom) / this.iconPrefab.height) * this.oneRowLimit;
            } else {
                this.oneRowLimit = Math.floor((this.content.height - this.contentLayout.paddingTop - this.contentLayout.paddingBottom) / this.iconPrefab.height);
                this.pageSize = Math.floor((this.viewMaskNode.width - this.contentLayout.paddingLeft - this.contentLayout.paddingRight) / this.iconPrefab.width) * this.oneRowLimit;
            }

            this.bindEvents();
        }
    }

    private bindEvents() {
        this.scrollView.node.on("scroll-ended", () => {
            this.startAutoScroll();
        });
        this.node.on("icon_tap", (event: Event) => {
            this.startAutoScroll();
            event.propagationStopped = true;
        });
    }

    private startAutoScroll() {
        if (this.gameAdList.length <= this.pageSize) return;
        let unshowRowCount = Math.ceil((this.gameAdList.length - this.pageSize) / this.oneRowLimit);
        let time = this.oneRowTime * unshowRowCount;

        if (this.isVertical) {
            let percent = Math.abs(this.scrollView.getScrollOffset().y / this.scrollView.getMaxScrollOffset().y) || 0;
            if (percent >= 0.999) {
                this.scrollView.scrollToTop(time, false);
                this.isScrollingToEnd = false;
            } else if (percent <= 0.001) {
                this.scrollView.scrollToBottom(time, false);
                this.isScrollingToEnd = true;
            } else if (this.isScrollingToEnd) {
                this.scrollView.scrollToBottom(time * (1 - percent), false);
            } else {
                this.scrollView.scrollToTop(time * (percent), false);
            }
        } else {
            let percent = Math.abs(this.scrollView.getScrollOffset().x / this.scrollView.getMaxScrollOffset().x) || 0;
            if (percent >= 0.999) {
                this.scrollView.scrollToLeft(time, false);
                this.isScrollingToEnd = false;
            } else if (percent <= 0.001) {
                this.scrollView.scrollToRight(time, false);
                this.isScrollingToEnd = true;
            } else if (this.isScrollingToEnd) {
                this.scrollView.scrollToRight(time * (1 - percent), false);
            } else {
                this.scrollView.scrollToLeft(time * (percent), false);
            }
        }
    }

    public loadGameAd(pos?: string) {
        if (pos) this.pos = pos;
        let nav = getPlatformApi().getGameNavigator();
        nav && nav.getGameAd(this.pos, -1, (error, list) => {
            if (!error) {
                this.setData(this.pos, list);
            }
        });
    }

    private setData(pos: string, gameAdList: GameAd[]) {
        this.init();
        this.gameAdList = gameAdList;
        this.content.destroyAllChildren();
        for (let gameAd of gameAdList) {
            let iconNode = instantiate(this.iconPrefab);
            iconNode.active = true;
            let icon = iconNode.getComponent(Icon);
            icon.setData(pos, gameAd, this.showTitle);
            this.content.addChild(iconNode);
        }
        this.scheduleOnce(() => {
            this.node.dispatchEvent(new Event("game_ad_loaded", true));
            if (!this.node.activeInHierarchy) return;
            this.isScrollingToEnd = true;
            this.startAutoScroll();
        });
    }
}
