let width = 0, list = [];

function setMsg(msg, index) {
  document.getElementById("msg").innerText = msg;
  if (index * 20 > list[list.length - 1]) {
    list.push(index * 20);
  }
  if (list.length == 0) {
    list.push(index * 20);
  }
}

const elem = document.getElementById("bar");
const id = setInterval(function () {
  if (list.length > 0) {
    if (width < list[list.length - 1]) {
      width++;
      elem.style.width = width + '%';
    }
  }
  if (width == 100) {
    clearInterval(id);
  }
}, 10);

