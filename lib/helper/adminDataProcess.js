export function objectFromFormData(formData) {
  var isJSON = require("is-json");
  var values = {};
  for (var pair of formData.entries()) {
    var key = pair[0];
    var value = pair[1];
    if (key.substring(0, 2) != "X_") {
      if (isJSON(value)) {
        value = JSON.parse(value);
      }
      if (values[key] != null) {
        if (!(values[key] instanceof Array)) {
          values[key] = new Array(values[key]);
        }
        values[key].push(value);
      } else {
        values[key] = value;
      }
    }
  }
  return values;
}

export function getDefaultData(dataObj, nameTag, defaultReturn) {
  if (dataObj && dataObj[nameTag] != null) {
    return dataObj[nameTag];
  }
  return defaultReturn;
}
