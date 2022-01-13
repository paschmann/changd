import http from "./http-common";

function getAuthHeader() {
    if (localStorage.getItem("token")) {
        return {"Authorization": "Bearer " + localStorage.getItem("token")}
    } else {
        return {};
    }
}

export const getMyUser = () => {
    return http.get("/users/me", { headers: getAuthHeader() });
}

export const getMyUserSettings = () => {
    return http.get("/users/me/settings", { headers: getAuthHeader() });
}

export const getAccount = () => {
    return http.get("/users/me", { headers: getAuthHeader() });
}

export const putAccount = ( obj ) => {
    return http.put("/users/me", obj, { headers: getAuthHeader() });
}

export const loginUser = ( obj ) => {
    return http.post("/login", obj);
}

export const registerUser = ( obj ) => {
    return http.post("/register", obj);
}

export const logoutUser = ( obj ) => {
    return http.post("/logout", obj);
}

export const setPassword = ( obj ) => {
    return http.post("/users/setpassword", obj);
}

export const forgotPassword = (obj) => {
    return http.post("/users/forgotpassword", obj);
}

export const changePassword = ( obj ) => {
    return http.post("/users/changepassword", obj, { headers: getAuthHeader() });
}

export const getXPathPreview = ( url, xpath ) => {
    return http.get("/preview/xpath?url=" + url + "&xpath=" + xpath, { headers: getAuthHeader() });
}

export const getAPIPreview = ( url, xpath ) => {
    return http.get("/preview/api?url=" + url, { headers: getAuthHeader() });
}

export const getJobs = ( status ) => {
    return http.get("/jobs?status=" + status, { headers: getAuthHeader() });
}

export const getJobDetail = ( job_id ) => {
    return http.get("/jobs/" + job_id, { headers: getAuthHeader() });
}

export const postJob = ( obj ) => {
    return http.post("/jobs", obj, { headers: getAuthHeader() });
}

export const putJob = ( job_id, obj ) => {
    return http.put("/jobs/" + job_id, obj, { headers: getAuthHeader() });
}

export const putJobStatus = ( job_id, obj ) => {
    return http.put("/jobs/" + job_id + "/status", obj, { headers: getAuthHeader() });
}

export const runJob = ( job_id, type ) => {
    return http.get("/jobs/" + job_id + "/run?type=" + type, { headers: getAuthHeader() });
}

export const getUserTimeline = () => {
    return http.get("/timeline", { headers: getAuthHeader() });
}

export const resetJob = ( job_id, obj ) => {
    return http.post("/jobs/" + job_id + "/reset", obj, { headers: getAuthHeader() });
}

export const deleteJob = ( job_id ) => {
    return http.delete("/jobs/" + job_id, { headers: getAuthHeader() });
}



export const getNotifications = ( status ) => {
    return http.get("/notifications", { headers: getAuthHeader() });
}

export const getNotificationDetail = ( notification_id ) => {
    return http.get("/notifications/" + notification_id, { headers: getAuthHeader() });
}

export const putNotification = ( notification_id, obj ) => {
    return http.put("/notifications/" + notification_id, obj, { headers: getAuthHeader() });
}

export const postNotification = ( obj ) => {
    return http.post("/notifications", obj, { headers: getAuthHeader() });
}

export const deleteNotification = ( notification_id ) => {
    return http.delete("/notifications/" + notification_id, { headers: getAuthHeader() });
}

export const getUsage = ( status ) => {
    return http.get("/analytics?status=" + status, { headers: getAuthHeader() });
}