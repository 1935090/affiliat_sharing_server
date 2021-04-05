//checked 2019-06-03
function getData() {
  return {
    "Hong Kong": { field: [], iso: "HK" },
    Taiwan: { field: ["idno"], iso: "TW" },
    Singapore: { field: ["zipcode"], iso: "SG" },
    Macau: { field: [], iso: "MO" },
    Malaysia: { field: ["zipcode", "townOrCity"], iso: "MY" },
  };
}

module.exports = {
  getData,
};
