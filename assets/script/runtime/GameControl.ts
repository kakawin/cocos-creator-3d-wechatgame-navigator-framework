import { _decorator, Component, Node, CameraComponent, instantiate, v3, geometry, Color, Vec3, tween } from 'cc';
import DataManager, { ILevelConfig } from '../data/DataManager';
import PanelManager from './PanelManager';
import SuccessPanel from '../ui/panel/SuccessPanel';
import FailPanel from '../ui/panel/FailPanel';
import AudioManager from './AudioManager';
import { GameState } from '../data/Emuns';
const { ccclass, property, menu } = _decorator;

@ccclass("GameControl")
@menu("runtime/GameControl")
export default class GameControl extends Component {

    public static instance: GameControl;

    @property({ type: CameraComponent })
    public camera: CameraComponent = null;

    @property({ type: Node })
    public sceneNode: Node = null;

    public gameState: GameState = GameState.READY;
    public gamePlayCount: number = 1;

    private isInited: boolean = false;
    private levelConfig: ILevelConfig = null;

    onLoad() {
        console.log("GameControl.onLoad()");
        GameControl.instance = this;
        this.init();
    }

    public init() {
        if (!this.isInited) {
            this.isInited = true;

        }
    }

    private clearScene() {
        this.sceneNode.destroyAllChildren();
    }

    private getLevelConfig(level: number): ILevelConfig {
        let config = DataManager.getLevelConfig(level);
        if (!config) {
            config = DataManager.getLevelConfig(Math.floor(Math.random() * 45 + 6));
        }
        return JSON.parse(JSON.stringify(config));
    }

    public loadScene(level: number, isReload: boolean = false) {
        this.clearScene();
        this.gameState = GameState.READY;

        DataManager.loadAllLevelConfig((allLevelConfig) => {
            if (!allLevelConfig) return;
            console.log("level: " + level);

            let levelConfig: ILevelConfig = (isReload && !allLevelConfig[level] && this.levelConfig) ? this.getLevelConfig(this.levelConfig.level) : this.getLevelConfig(level);
            if (!levelConfig) { return; }
            this.levelConfig = levelConfig;

            this.scheduleOnce(() => {
                this.fitCamera();
                this.gameState = GameState.PLAYING;
                this.gamePlayCount++;
            });
        });
    }

    private fitCamera() {

    }

    private gameFinish() {
        if (this.gameState === GameState.PLAYING) {
            this.gameState = GameState.FINISH;
            AudioManager.instance.playAudioSuccess();
            this.scheduleOnce(() => {
                PanelManager.instance.openPanel(SuccessPanel);
            }, 0.5);
        }
    }

    private gameFail() {
        if (this.gameState === GameState.PLAYING) {
            this.gameState = GameState.FAIL;
            AudioManager.instance.playAudioFail();
            this.scheduleOnce(() => {
                PanelManager.instance.openPanel(FailPanel);
            }, 0.5);
        }
    }

    private gameRevive() {

    }
}