import { _decorator, Component, Node, AudioClip, loader, AudioSourceComponent } from 'cc';
import DataManager from '../data/DataManager';
const { ccclass, property, menu } = _decorator;

@ccclass("AudioManager")
@menu("runtime/AudioManager")
export default class AudioManager extends Component {

    public static instance: AudioManager;

    private isInited: boolean = false;

    @property(AudioSourceComponent)
    private audioSource: AudioSourceComponent = null;

    private backgroundUrl: string = "";

    onLoad() {
        console.log("AudioManager.onLoad()");
        AudioManager.instance = this;
        this.init();
    }

    public init() {
        if (!this.isInited) {
            this.isInited = true;
        }
    }

    public musicOn() {
        if (!DataManager.getGameData().musicEnabled) return;
        this.playMusicGameBackground();
        this.audioSource.volume = 1;
    }

    public musicOff() {
        if (!DataManager.getGameData().musicEnabled) return;
        this.stopMusic();
        this.audioSource.volume = 0;
    }

    public setMusicEnabled(enable: boolean) {
        DataManager.getGameData().musicEnabled = enable;
        DataManager.saveGameData();
        if (enable) {
            if (this.backgroundUrl) {
                this.playMusic(this.backgroundUrl);
            } else {
                this.playMusicGameBackground();
            }
        } else {
            this.stopMusic();
        }
    }

    public stopMusic() {
        this.audioSource.stop();
        this.backgroundUrl = "";
    }

    public setSoundEnabled(enable: boolean) {
        DataManager.getGameData().soundEnabled = enable;
        DataManager.saveGameData();
    }

    public playEffect(url: string) {
        if (!DataManager.getGameData().soundEnabled) return;
        loader.loadRes(url, AudioClip, (error: Error, clip: AudioClip) => {
            if (!error) {
                this.audioSource.playOneShot(clip);
            } else {
                console.error(error);
            }
        });
    }

    public playMusic(url: string) {
        if (!DataManager.getGameData().musicEnabled) return;
        if (this.backgroundUrl === url) return;
        this.backgroundUrl = url;
        loader.loadRes(url, AudioClip, (error: Error, clip: AudioClip) => {
            if (!error) {
                if (this.backgroundUrl === url) {
                    this.audioSource.stop();
                    this.audioSource.clip = clip;
                    this.audioSource.play();
                    console.log("bg", url);
                }
            } else {
                console.error(error);
            }
        });
    }

    public playMusicGameBackground() {
        this.playMusic("audio/gamebg");
    }

    public playAudioSuccess() {
        this.stopMusic();
        this.playEffect("audio/success");
        this.scheduleOnce(() => {
            this.playMusicGameBackground();
        }, 4);
    }

    public playAudioFail() {
        this.stopMusic();
        this.playEffect("audio/fail");
        this.scheduleOnce(() => {
            this.playMusicGameBackground();
        }, 4);
    }

    public playAudioClick() {
        this.playEffect("audio/click");
    }
}