export default function getRootUrl() {
  //const port = process.env.PORT || 3000;
  //const dev = process.env.NODE_ENV !== "production";
  //const ROOT_URL = dev ? process.env.ROOT_URL : "http://xxxx";

  const url = window.location.href;
  const arr = url.split("/");
  const ROOT_URL = arr[0] + "//" + arr[2];
  //console.log(result);
  return ROOT_URL;
}
