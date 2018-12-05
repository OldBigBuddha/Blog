const title = document.getElementsByClassName("post__title")[0].textContent;
const twitter = document.getElementById("twitter");
const facebook = document.getElementById("facebook");
const hatebu = document.getElementById("hatebu");
const link = document.getElementById("link");
const notification = document.getElementById("notification");

const share = (size, url) => {
  window.open(url, "_blank", size);
}

twitter.addEventListener("click", () => {
  share("menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400, width=600", "//twitter.com/share?url=" + location.href);
}, false);

facebook.addEventListener("click", () => {
  share("menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=800, width=600", "//www.facebook.com/sharer.php?src=bm&u=" + location.href + "&t=" + title);
}, false);

hatebu.addEventListener("click", () => {
  share("menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600, width=1000", "//b.hatena.ne.jp/entry/" + location.href);
});

link.addEventListener("click", () => {
  const temp = document.createElement("textarea");
  temp.textContent = location.href;

  const bodyElm = document.getElementsByTagName("body")[0];
  bodyElm.appendChild(temp);

  temp.select();
  document.execCommand('copy');

  bodyElm.removeChild(temp);
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 1500);
});