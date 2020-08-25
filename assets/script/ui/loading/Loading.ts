import { _decorator, Component, director, LabelComponent, view, ResolutionPolicy, ProgressBarComponent } from "cc";
import { getPlatformApi } from "../../platform/PlatformApi";
import Global from "../../data/Global";
import DataManager from "../../data/DataManager";
const { ccclass, property, menu } = _decorator;

@ccclass("Loading")
@menu("ui/loading/Loading")
export default class Loading extends Component {
    @property({ type: LabelComponent })
    private progressLabel: LabelComponent = null;
    @property({ type: ProgressBarComponent })
    private progressBar: ProgressBarComponent = null;

    onLoad() {
        console.log("Loading.onLoad()");

        const winSize = view.getCanvasSize();
        if (winSize.width / winSize.height > 0.563) {
            view.setDesignResolutionSize(750, 1334, ResolutionPolicy.SHOW_ALL);
            view.setCanvasSize(view.getCanvasSize().width, view.getCanvasSize().height);
        }
    }
    start() {
        const platform = getPlatformApi();
        platform.init();
        platform.login((error, conf, data, user) => {
            Object.assign(Global.config, conf);
            Object.assign(Global.gameData, data);
            Object.assign(Global.user, user);

            console.log(Global);
        });
        platform.onLogined(() => {
            platform.onHide(() => {
                DataManager.saveGameData(true);
            });
        });

        const mainSceneName = "main";
        const subpackageName = "";
        const SUBPACKAGE_RATE: number = 0.45;
        this.setProgress(0);
        platform.loadSubpackage(subpackageName, (error) => {
            console.log("loadSubpackage: " + subpackageName, !error);
            this.setProgress(SUBPACKAGE_RATE);
            director.preloadScene(mainSceneName, (completedCount: number, totalCount: number) => {
                this.setProgress(completedCount / totalCount * (1 - SUBPACKAGE_RATE) + SUBPACKAGE_RATE);
            }, () => {
                platform.onLogined(() => {
                    director.loadScene(mainSceneName);
                });
            });
        }, (progress: number) => {
            this.setProgress(progress * SUBPACKAGE_RATE);
        });
    }

    private setProgress(progress: number) {
        if (progress > 1) progress = 1;
        if (!progress) progress = 0;
        this.progressBar.progress = progress;
        this.progressLabel.string = Math.floor(progress * 100) + "%";
    }
}
