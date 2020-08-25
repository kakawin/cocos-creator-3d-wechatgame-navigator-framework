import { _decorator, Component } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass("ResourceManager")
@menu("runtime/ResourceManager")
export default class ResourceManager extends Component {

    public static instance: ResourceManager;

    private isInited: boolean = false;

    onLoad() {
        console.log("ResourceManager.onLoad()");
        ResourceManager.instance = this;
        this.init();
    }

    public init() {
        if (!this.isInited) {
            this.isInited = true;
        }
    }

}