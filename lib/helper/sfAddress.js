const lockerData = require("./sfAddressData").locker;

function getDistrict() {
  let district = [];
  let currentDistrict = null;
  for (let i = 0; i < lockerData.length; i++) {
    const districtName = lockerData[i].terrS + " - " + lockerData[i].district;
    if (districtName != currentDistrict) {
      currentDistrict = districtName;
      district.push({
        districtName,
        terrS: lockerData[i].terrS,
        terr: lockerData[i].terr,
        district: lockerData[i].district
      });
    }
  }
  return district.sort((a, b) => {
    let nameA = a.districtName;
    let nameB = b.districtName;
    if (nameA < nameB) return -1;
    else if (nameA > nameB) return 1;
    return 0;
  });
}

function getLockerCode(districtName) {
  let locker = [];

  lockerData.filter(a => {
    let districtNameA = a.terrS + " - " + a.district;
    if (districtNameA == districtName) {
      locker.push(a);
    }
  });

  return locker.sort((a, b) => {
    let nameA = a.code;
    let nameB = b.code;
    if (nameA < nameB) return -1;
    else if (nameA > nameB) return 1;
    return 0;
  });
}

function getAddressByCode(code) {
  //let district = [];
  return lockerData.find(a => {
    return a.code == code;
  });
}

module.exports = {
  getDistrict,
  getLockerCode,
  getAddressByCode
};
