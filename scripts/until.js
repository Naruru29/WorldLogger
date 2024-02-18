import { world, system, GameMode } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";

export class until {
    static formbusy(player, form){
        return new Promise(res => {
            system.run(async function run() {
                const response = await form.show(player);
                const {canceled, cancelationReason: reason} = response;
                if (canceled && reason === UI.FormCancelationReason.UserBusy) return system.run(run);
                res(response);
            });
        });
    };

    static getNewLog(player, array) {
        player.log = [];
        for (const item of array) {
            for (const key of item) {
                player.log.push(key);
            };
        };
    
        let newlogs = [];
        let logs = JSON.parse(JSON.stringify(player.log));

        while (true) {
            if (logs.length === 0) break;
            if (logs.length >= 30) {
                newlogs.push(logs.slice(0, 30));
                logs.splice(0, 30);
            } else {
                newlogs.push(logs.slice(0, logs.length));
                logs.splice(0, logs.length);
            };
        };
    
        return newlogs;
    };
};