import { world, system } from "@minecraft/server";
import * as DyProp from "./lib/DyProp";
import * as date from "./lib/date";
import { access } from "./form/access";
import { block } from "./form/block";
import { entity } from "./form/entity";
import { chat } from "./form/chat";

/* load */
world.afterEvents.worldInitialize.subscribe(ev => {
    if (world.getDynamicProperty("log_state") === undefined) world.setDynamicProperty("log_state", true);
});

/* command */
world.beforeEvents.chatSend.subscribe(ev => {
    const { sender, message } = ev;

    if (!sender.hasTag("op")) return;
    switch (message) {
        // get log on
        case "log on": {
            ev.cancel = true;
            if (world.getDynamicProperty("log_state")) sender.sendMessage("§f[§eLOG§f] §c既にログはオンになっています");
            else {
                world.setDynamicProperty("log_state", true);
                sender.sendMessage("§f[§eLOG§f] §aログがオンになりました");
            };
            break;
        };

        // get log off
        case "log off": {
            ev.cancel = true;
            if (!world.getDynamicProperty("log_state")) sender.sendMessage("§f[§eLOG§f] §c既にログはオフになっています");
            else {
                world.setDynamicProperty("log_state", false);
                sender.sendMessage("§f[§eLOG§f] §aログがオフになりました");
            };
            break;
        };

        // check log on or off
        case "log": {
            ev.cancel = true;
            if (sender.getDynamicProperty("log_show") === undefined) sender.setDynamicProperty("log_show", false);
            if (!sender.getDynamicProperty("log_show")) {
                sender.setDynamicProperty("log_show", true);
                sender.sendMessage("§f[§eLOG§f] §aログ表示がオンになりました");
            }else {
                sender.setDynamicProperty("log_show", false);
                sender.sendMessage("§f[§eLOG§f] §aログ表示がオフになりました");
            };
            break;
        };

        // access log show
        case "log access": {
            ev.cancel = true;
            if (!sender.getDynamicProperty("log_show")) return sender.sendMessage("§f[§eLOG§f] §cログ表示をオンにしてください");
            new access(sender).list(true);
            break;
        };

        // block log show
        case "log block": {
            ev.cancel = true;
            if (!sender.getDynamicProperty("log_show")) return sender.sendMessage("§f[§eLOG§f] §cログ表示をオンにしてください");
            new block(sender).list(true);
            break;
        };

        // entity log show
        case "log entity": {
            ev.cancel = true;
            if (!sender.getDynamicProperty("log_show")) return sender.sendMessage("§f[§eLOG§f] §cログ表示をオンにしてください");
            new entity(sender).list(true);
            break;
        };

        // chat log show
        case "log chat": {
            ev.cancel = true;
            if (!sender.getDynamicProperty("log_show")) return sender.sendMessage("§f[§eLOG§f] §cログ表示をオンにしてください");
            new chat(sender).list(true);
            break;
        };
    };
});

/* access Log */
world.afterEvents.playerSpawn.subscribe(ev => {
    const { initialSpawn, player } = ev;
    const log_state = world.getDynamicProperty("log_state");

    if (!log_state) return;
    if (initialSpawn) {
        const id = "access";
        const log = {
            name: player.name,
            type: "join",
            date: date.getFullTime(),
        };

        DyProp.save(id, JSON.stringify(log));
    };
});
world.afterEvents.playerLeave.subscribe(ev => {
    const { playerId, playerName } = ev;
    const log_state = world.getDynamicProperty("log_state");

    if (!log_state) return;
    
    const id = "access";
    const log = {
        name: playerName,
        type: "leave",
        date: date.getFullTime(),
    };

    DyProp.save(id, JSON.stringify(log));
});

/* block Log */
world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const { block, dimension, player } = ev;
    const log_state = world.getDynamicProperty("log_state");

    if (player.getDynamicProperty("log_show")) return;
    if (!log_state) return;

    const id = "block";
    const log = {
        name: player.name,
        type: "place",
        block: {
            id: block.typeId,
            location: block.location,
            dimension: dimension.id
        },
        date: date.getFullTime()
    };

    player.place = true;
    DyProp.save(id, JSON.stringify(log));
});
world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const { block: breakBlock, dimension, player } = ev;

    if (player.getDynamicProperty("log_show")) {
        if (player.show) return;
        const search = {
            location: breakBlock.location,
            dimension: dimension.id.split(":")[1]
        };
        new block(player).list(true, search);
        ev.cancel = true;
        return;
    };

    const log_state = world.getDynamicProperty("log_state");

    if (!log_state) return;

    const id = "block";
    const log = {
        name: player.name,
        type: "break",
        block: {
            id: breakBlock.typeId,
            location: breakBlock.location,
            dimension: dimension.id
        },
        date: date.getFullTime()
    };

    DyProp.save(id, JSON.stringify(log));
});
world.afterEvents.explosion.subscribe(ev => {
    const { dimension, source } = ev;
    const blocks = ev.getImpactedBlocks();
    const log_state = world.getDynamicProperty("log_state");

    if (source.getDynamicProperty("log_show")) return;
    if (!log_state) return;
    for (const block of blocks) {
        const id = "block";
        const log = {
            name: source ? source.typeId : "???",
            type: "explosion",
            block: {
                id: block.typeId,
                location: block.location,
                dimension: dimension.id
            },
            date: date.getFullTime()
        };

        DyProp.save(id, JSON.stringify(log));
    };
});
world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { block: InteractBlock, blockFace, player } = ev;

    if (player.getDynamicProperty("log_show")) {
        if (player.show) return;
        const search = {
            location: InteractBlock.location,
            dimension: InteractBlock.dimension.id.split(":")[1]
        };
        new block(player).list(true, search);
        ev.cancel = true;
        return;
    };
});
world.afterEvents.playerInteractWithBlock.subscribe(ev => {
    const { block, blockFace, player } = ev;
    const log_state = world.getDynamicProperty("log_state");

    if (player.getDynamicProperty("log_show")) return;
    if (!log_state) return;
    if (player.place) return player.place = false;
    if (!player.getDynamicProperty("InteractBlockCount")) player.setDynamicProperty("InteractBlockCount", 0);
    player.setDynamicProperty("InteractBlock", JSON.stringify({
        state: true,
        block: {
            location: { x: block.x, y: block.y, z: block.z },
            dimension: block.dimension.id,
            id: block.typeId
        }
    }));
});
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!player.getDynamicProperty("InteractBlock")) continue;
        const InteractBlock = JSON.parse(player.getDynamicProperty("InteractBlock"));
        if (InteractBlock.state) {
            player.setDynamicProperty("InteractBlockCount", player.getDynamicProperty("InteractBlockCount") + 1);
            InteractBlock.state = false;

            if (player.getDynamicProperty("InteractBlockCount") == 1) {
                const blockid = InteractBlock.block.id;
                const blocklocation = InteractBlock.block.location;
                const blockdimension = InteractBlock.block.dimension;
                const id = "block";
                const log = {
                    name: player.name,
                    type: "use",
                    block: {
                        id: blockid,
                        location: blocklocation,
                        dimension: blockdimension
                    },
                    date: date.getFullTime()
                };

                DyProp.save(id, JSON.stringify(log));
            };
        } else player.setDynamicProperty("InteractBlockCount", 0);

        player.setDynamicProperty("InteractBlock", JSON.stringify(InteractBlock));
    };
});

/* entity Log */
world.afterEvents.entityDie.subscribe(ev => {
    const { damageSource, deadEntity } = ev;
    const { cause, damagingEntity, damageingProjecctile } = damageSource;
    
    if (damagingEntity?.typeId === "minecraft:player") {
        const log_state = world.getDynamicProperty("log_state");

        if (!log_state) return;
    
        const id = "entity";
        const log = {
            name: deadEntity.typeId,
            type: "killed",
            by: damagingEntity.name,
            location: { x: Math.floor(deadEntity.location.x), y: Math.floor(deadEntity.location.y), z: Math.floor(deadEntity.location.z) },
            dimension: deadEntity.dimension.id,
            date: date.getFullTime(),
        };
    
        DyProp.save(id, JSON.stringify(log));
    };
});
world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    const { itemStack, player, target } = ev;
    const log_state = world.getDynamicProperty("log_state");

    if (!log_state) return;

    const id = "entity";
    const log = {
        name: target.typeId,
        type: "used",
        by: player.name,
        location: { x: Math.floor(target.location.x), y: Math.floor(target.location.y), z: Math.floor(target.location.z) },
        dimension: target.dimension.id,
        date: date.getFullTime(),
    };

    DyProp.save(id, JSON.stringify(log));
});

/* chat Log */
world.afterEvents.chatSend.subscribe(ev => {
    const { sender, message } = ev;
    const log_state = world.getDynamicProperty("log_state");

    if (!log_state) return;

    const id = "chat";
    const log = {
        name: sender.name,
        type: "chat",
        message: message,
        date: date.getFullTime(),
    };

    DyProp.save(id, JSON.stringify(log));
});