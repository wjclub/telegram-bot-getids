const ages = require("./ages.json");

const ids = Object.keys(ages);
const nids = ids.map((e) => parseInt(e));

const minId = nids[0];
const maxId = nids[nids.length - 1];

const getDate = (id) => {
  if (id < minId) {
    return [-1, new Date(ages[ids[0]])];
  } else if (id > maxId) {
    return [1, new Date(ages[ids[ids.length - 1]])];
  } else {
    let lid = nids[0];
    for (let i = 0; i < ids.length; i++) {
      if (id <= nids[i]) {
        // calculate middle date
        const uid = nids[i];
        const lage = ages[lid];
        const uage = ages[uid];

        const idratio = (id - lid) / (uid - lid);
        const midDate = Math.floor(idratio * (uage - lage) + lage);
        return [0, new Date(midDate)];
      } else {
        lid = nids[i];
      }
    }
  }
};

const getAge = (id) => {
  const d = getDate(id);
  return [
    d[0] < 0 ? "older_than" : d[0] > 0 ? "newer_than" : "aprox",
    `${d[1].getUTCMonth() + 1}/${d[1].getUTCFullYear()}`,
  ];
};

module.exports = getAge;
