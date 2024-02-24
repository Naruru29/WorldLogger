import { world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import * as DyProp from "../lib/DyProp";
import { until } from "../until";

export class entity {
    constructor(player){
        this.player = player;
    };

    async list(busy){
        this.player.show = true;
        const form = new UI.ActionFormData();
        const array = await DyProp.get("entity");

        form.title("エンティティログ")
        .body("フォーム上では、最大過去900件まで表示可能です")

        let i = 0;
        const newlogs = until.getNewLog(this.player, array).reverse();

        for (const log of newlogs) {
            form.button(`§l[${i}]ログ - ${log.length}件`)
            if (i === 29) break;
            i++;
        };

        form.button("閉じる")

        const { selection, canceled } = busy
        ? await until.formbusy(this.player, form)
        : await form.show(this.player);
        if (canceled) return this.player.show = false;
        if (selection === newlogs.length) return this.player.show = false;
        this.selectlist(this.player, newlogs[selection]);
    };
    
    async selectlist(player, logs) {
        player.show = true;
        const form = new UI.ActionFormData();
        let contents = [];

        form.title("エンティティログ")

        for (const log of logs) {
            const data = JSON.parse(log);
            contents.push(`§f${data.date} - §d${data.name.split(":")[1]}§f ${data.type === "killed" ? "§c" : null}${data.type}§f by §e${data.by} §b(${data.location.x}, ${data.location.y}, ${data.location.z}: ${data.dimension.split(":")[1]})§f`);
        };

        form.body(contents.join("\n"))
        form.button("戻る")
        const { selection, canceled } = await form.show(player);
        if (canceled) return player.show = false;
        if (selection === 0) return this.list(player);
    };
};
