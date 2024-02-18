import { world } from "@minecraft/server";
const startId = "DyProp_"

export async function save(id, string) {
    let i = 0;
    while (true) {
        const ObjectId = `${startId}${id}_${i}`;
        const Object = !world.getDynamicProperty(ObjectId) ? [] : JSON.parse(world.getDynamicProperty(ObjectId));
        
        Object.push(string);
        try {
            world.setDynamicProperty(ObjectId, JSON.stringify(Object));
            break;
        } catch {
            i++;
            continue;
        };
    };

    return true;
};

export async function get(id) {
    let array = [];
    let i = 0;
    while (true) {
        const ObjectId = `${startId}${id}_${i}`;

        if (world.getDynamicProperty(ObjectId) === undefined) break;

        const Object = JSON.parse(world.getDynamicProperty(ObjectId));

        array.push(Object);
        i++;
    };

    return array;
};

export async function getIds() {
    let ids = JSON.parse(JSON.stringify(world.getDynamicPropertyIds()));
    let array = [];
    let i = 0;

    test: while (true) {
        if (ids.length === 0) break;
        for (const id of ids) {
            if (id.startsWith(startId) && id.endsWith(`_${i}`)) {
                const item = id.replace(startId, "").replace(`_${i}`);
                if (!array.includes(item)) {
                    array.push(item);
                    ids.splice(ids.indexOf(id), 1);
                };
            }
        };

        i++;
    };

    return array;
};