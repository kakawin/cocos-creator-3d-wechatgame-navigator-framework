interface Handler {
    event: string;
    listener: Function;
    caller: any;
}

class EventManager {

    private handlerMap: { [event: string]: Handler[] } = {};

    /**注册事件 */
    public on(event: string, listener: Function, caller: any) {
        let handlerList = this.handlerMap[event];
        if (!handlerList) {
            this.handlerMap[event] = [{ event, listener, caller }];
            return;
        }
        for (let i = 0; i < handlerList.length; i++) {
            let handler = handlerList[i];
            if (handler.listener === listener && handler.caller === caller) {
                return;
            }
        }
        handlerList.push({ event, listener, caller });
    }

    /**取消已注册事件 */
    public off(event: string, listener: Function, caller: any) {
        let handlerList = this.handlerMap[event];
        if (handlerList && handlerList.length) {
            let found = false;
            let index = 0;
            for (let i = 0; i < handlerList.length; i++) {
                let handler = handlerList[i];
                if (handler.listener === listener && handler.caller === caller) {
                    found = true;
                    index = i;
                    break;
                }
            }
            found && handlerList.splice(index, 1);
        }
    }

    /**触发事件 */
    public emit(event: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) {
        let handlerList = this.handlerMap[event];
        if (handlerList && handlerList.length) {
            for (let handler of handlerList) {
                handler.listener.bind(handler.caller)(arg1, arg2, arg3, arg4, arg5);
            }
        }
    }

}

export default new EventManager();