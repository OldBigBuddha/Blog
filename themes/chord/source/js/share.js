const title = document.getElementsByClassName("post__title")[0].textContent;
const twitter = document.getElementById("twitter");

twitter.addEventListener("click", () => {
  //処理
  const size = "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400, width=600";
  const url = "//twitter.com/share?url=" + location.href;
  window.open(url, "_blank", size);
}, false);