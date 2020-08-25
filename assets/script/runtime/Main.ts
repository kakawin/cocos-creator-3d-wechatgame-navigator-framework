import { _decorator, Component, director, CanvasComponent, view, ResolutionPolicy } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass("Main")
@menu("runtime/Main")
export default class Main extends Component {

    onLoad() {
        console.log("Main.onLoad()");

        const winSize = view.getCanvasSize();
        if (winSize.width / winSize.height > 0.563) {
            view.setDesignResolutionSize(750, 1334, ResolutionPolicy.SHOW_ALL);
            view.setCanvasSize(view.getCanvasSize().width, view.getCanvasSize().height);
        }
    }
}
