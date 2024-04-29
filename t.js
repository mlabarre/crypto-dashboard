
let x = "2024-03-28T19:10:41.715Z"

let pad = (o) => {
    if (o>9) {
        return o;
    } else {
        return "0"+o;
    }
}

const getDateFromDate = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

const getTimeFromDate = (d) => {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
let d = new Date(x);
console.log ( `${getDateFromDate(d)} ${getTimeFromDate(d)}` )

let f = (a,b) => {
   console.log(a)
   console.log(b)
}

f(0,"A");
f(0);
