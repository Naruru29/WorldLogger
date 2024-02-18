import { world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import * as DyProp from "../lib/DyProp";
import { until } from "../until";

export class block {
    constructor(player){
        this.player = player;
    };

    async list(busy, search){
        this.player.show = true;
        const form = new UI.ActionFormData();
        const array = await DyProp.get("block");
        let i = 0;
        let newlogs = until.getNewLog(this.player, array).reverse();

        if (!search) {
            form.title("ブロックログ")
            .body("フォーム上では、最大過去900件まで表示可能です\n検索を使用することで、もっと前まで表示することができます")
            .button("検索")

            for (const log of newlogs) {
                form.button(`§l[${i}]ログ - ${log.length}件`)
                if (i === 29) break;
                i++;
            };

            form.button("閉じる")
        } else {
            form.title("ブロックログ")
            .body(`フォーム上では、最大過去900件まで表示可能です\n場所: §b${!search.location ? "設定しない" : `${search.location.x}, ${search.location.y}, ${search.location.z}`}§f\nディメンション: §d${!search.dimension ? "設定しない" : `${search.dimension}`}§f`)
            .button("検索")

            let datas = [[]];

            for (const logs of newlogs) {
                let dataarray = [];
                for (const log of logs) {
                    const data = JSON.parse(log);
                    if (search.location) {
                        const location = search.location;
                        if (
                            data.block.location.x === location.x &&
                            data.block.location.y === location.y &&
                            data.block.location.z === location.z
                        ) {
                            dataarray.push(log);
                        };
                    } else if (search.dimension) {
                        const dimension = search.dimension;
                        if (data.block.dimension.split(":")[1] === dimension) {
                            dataarray.push(log);
                        };
                    };
                };
                datas.push(dataarray);
            };

            newlogs = until.getNewLog(this.player, datas);
            for (const log of newlogs) {
                form.button(`§l[${i}]ログ - ${log.length}件`)
                if (i === 29) break;
                i++;
            };

            form.button("閉じる")
        };

        const { selection, canceled } = busy
        ? await until.formbusy(this.player, form)
        : await form.show(this.player);
        if (canceled) return this.player.show = false;
        if (selection === 0) return this.search(this.player, search);
        if (selection === newlogs.length + 1) return this.player.show = false;
        this.selectlist(this.player, newlogs[selection - 1], search);
    };
    
    async selectlist(player, logs, search) {
        player.show = true;
        const form = new UI.ActionFormData();
        let contents = [];

        form.title("ブロックログ")

        for (const log of logs) {
            const data = JSON.parse(log);
            contents.push(`§f${data.date} - ${data.type === "place" ? "§a" : data.type === "break" ? "§c" : data.type === "use" ? "§d" : data.type === "explosion" ? "§4" : null}${data.type} §f${data.block.id.split(":")[1]} §b(${data.block.location.x}, ${data.block.location.y}, ${data.block.location.z}: ${data.block.dimension.split(":")[1]})§f §e${data.name}§f`);
        };

        form.body(contents.join("\n"))
        form.button("戻る")
        const { selection, canceled } = await form.show(player);
        if (canceled) return player.show = false;
        if (selection === 0) return this.list(player, search);
    };

    async search(player, search) {
        player.show = true;
        const form = new UI.ModalFormData();
        if (!search) search = {};

        form.title("検索")
        .textField("設定しない場合は空白を設定\n\n座標(x, y, z)", "x, y, z", !search.location ? "" : `${search.location.x}, ${search.location.y}, ${search.location.z}`)
        .textField("ディメンション", "overworld", !search.dimension ? "" : `${search.dimension}`)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return player.show = false;

        if (formValues[0].trim() !== "") {
            const location = formValues[0].split(",");

            if (location[0] && location[1] && location[2]) {
                const loc = { x: parseFloat(location[0]), y: parseFloat(location[1]), z: parseFloat(location[2]) };

                if (loc.x && loc.y && loc.z) {
                    search.location = loc;
                };
            };
        } else delete search.location;

        if (formValues[1].trim() !== "") {
            const dimension = formValues[1].includes(":") ? formValues[1].split(":")[1] : formValues[1];
            search.dimension = dimension;
        } else delete search.dimension;

        if (formValues[0].trim() === "" && formValues[1].trim() === "") search = undefined;

        this.list(true, search);
    };
};