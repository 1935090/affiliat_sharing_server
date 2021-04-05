import sendRequest from "./sendRequest";
const BASE_PATH = "/api/v1/public";

export const getTeacherList = ({ pageNum }) =>
  sendRequest(`${BASE_PATH}/get-teacher-list?pageNum=${pageNum}`, {
    method: "GET"
  });

/*export const getTeacherScheduleList = ({ teacherId, week }) =>
  sendRequest(
    `${BASE_PATH}/get-teacher-schedule-list?teacherId=${teacherId}&week=${week}`,
    {
      method: "GET"
    }
  );*/

export const signUp = ({ email, password, type, userGroup }) =>
  sendRequest(`${BASE_PATH}/sign-up`, {
    body: JSON.stringify({ email, password, type, userGroup })
  });

export const login = ({ email, password }) =>
  sendRequest(`${BASE_PATH}/login`, {
    body: JSON.stringify({ email, password })
  });

export const getItemPackageList = () =>
  sendRequest(`${BASE_PATH}/get-item-package-list`, {
    method: "GET"
  });

/*export const getTeacherList = () =>
  sendRequest(`${BASE_PATH}/get-teacher-list`, {
    method: "GET"
  });*/
