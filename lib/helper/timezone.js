import Moment from "moment";

export function calTimezone(originalTime, timeZoneDifference) {
  var result = {};
  var shift = 0;
  if (timeZoneDifference == "0") {
    result = { time: originalTime, shift };
  } else {
    timeZoneDifference = parseFloat(timeZoneDifference);
    let string = originalTime.split(":");
    string[0] = parseInt(string[0]) + timeZoneDifference;
    if (string[0] < 0) {
      shift = -1;
      string[0] += 24;
    } else if (string[0] > 23) {
      shift = 1;
      string[0] -= 24;
    }
    string[0] = String(string[0]);
    if (string[0].length == 1) string[0] = "0" + string[0];
    string = string.join(":");
    result = { time: string, shift };
  }
  return result;
}

export function calShiftedDay(originalDay, Shift) {
  const shiftedDate = Moment(originalDay)
    .add(-Shift, "days")
    .format("YYYY[-]MM[-]DD");
  return shiftedDate;
}

export function formatDatetime(originalDatetime, format, timeZoneDifference) {
  timeZoneDifference = parseFloat(timeZoneDifference);
  const datetime = Moment(originalDatetime)
    .utc()
    .add(timeZoneDifference, "hours")
    .format(format);
  return datetime;
}
