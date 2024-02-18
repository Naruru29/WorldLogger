export function getTime(time) {
    const times = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
    };
    const date = new Date();
    const utc = date.toUTCString();
    const g = utc.replace('GMT', '');
    const gDate = new Date(g);
    const hours = gDate.getHours();
    gDate.setHours(hours + 9);
    times.year = gDate.getFullYear()
    times.month = gDate.getMonth()+1;
    times.day = gDate.getDate();
    times.hour = gDate.getHours();
    times.minute = gDate.getMinutes();
    times.second = gDate.getSeconds();

    return times[time];
};

export function getFullTime() {
    const times = {
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
    };
    const date = new Date();
    const utc = date.toUTCString();
    const g = utc.replace('GMT', '');
    const gDate = new Date(g);
    const hours = gDate.getHours();
    gDate.setHours(hours + 9);
    times.year = gDate.getFullYear()
    times.month = gDate.getMonth()+1;
    times.day = gDate.getDate();
    times.hour = gDate.getHours();
    times.minute = gDate.getMinutes();
    times.second = gDate.getSeconds();

    return `${times.year}/${times.month}/${times.day} ${times.hour}:${times.minute}:${times.second}`;
};