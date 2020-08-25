import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("BasePanel")
export default class BasePanel extends Component {

    public isOpened: boolean = false;
    public open(param?: any) {
        this.init();
        this.node.active = true;
        this.isOpened = true;
        this.onOpen(param);
    }

    public close(param?: any) {
        this.onClose(param);
        this.node.active = false;
        this.isOpened = false;
    }

    protected init() { };
    protected onOpen(param?: any) { };
    protected onClose(param?: any) { };
}
