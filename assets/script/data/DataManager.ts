import { loader, JsonAsset } from "cc";
import Global from "./Global";
import { getPlatformApi } from "../platform/PlatformApi";

export interface ILevelConfig {
    level: number;
}

class DataManager {

    private allLevelConfig: { [level: string]: ILevelConfig } = null;

    public loadAllLevelConfig(callback?: (allLevelConfig: { [level: string]: ILevelConfig }) => void) {
        if (this.allLevelConfig) {
            callback && setTimeout(() => {
                callback(this.allLevelConfig);
            });
        } else {
            loader.loadRes("data/levelConfig", JsonAsset, (error: Error, jsonAsset: JsonAsset) => {
                if (!this.allLevelConfig && !error) {
                    this.allLevelConfig = jsonAsset.json as { [level: string]: ILevelConfig };
                    callback && callback(this.allLevelConfig);
                } else {
                    callback && callback(this.allLevelConfig);
                }
            });
        }
    }

    public getAllLevelConfig(): { [level: string]: ILevelConfig } {
        return this.allLevelConfig;
    }

    public getLevelConfig(level: number): ILevelConfig {
        return this.allLevelConfig[level + ""] || null;
    }

    public getGameData() {
        return Global.gameData;
    }

    public getConfig() {
        return Global.config;
    }

    public saveGameData(post: boolean = false) {
        Global.gameData.updateTimestamp = Date.now();
        getPlatformApi().setGameData(Global.gameData, post);
    }
}

export default new DataManager();