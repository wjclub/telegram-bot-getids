ages = require('./ages.json')

const ids = Object.keys(ages)
const nids = ids.map(e => parseInt(e))

const min_id = nids[0]
const max_id = nids[nids.length-1]

const getDate = (id) => {

    // < than smallest ID
    if (id < min_id) {
        return [-1, new Date(ages[ids[0]])]
    }

    // > than biggest ID
    else if (id > max_id) {
        return [1, new Date(ages[ids[ids.length-1]])]
    }

    // between
    else {
        let lid = nids[0];
        for (let i = 0; i < ids.length; i++) {
            if (id <= nids[i]) {

                // calculate middle date
                const uid  = nids[i]
                const lage = ages[lid]
                const uage = ages[uid]

                const idratio = ((id-lid)/(uid-lid))
                const midDate = Math.floor((idratio*(uage-lage))+lage)
                return [0, new Date(midDate)]
            } else {
                lid = nids[i]
            }
        }
    }
}
const getAge = (id) => {
    const d = getDate(id)
    return [d[0]<0?'older_than':d[0]>0?'newer_than':'aprox', `${(d[1].getUTCMonth()+1)}/${d[1].getUTCFullYear()}`]
}

module.exports = getAge;
