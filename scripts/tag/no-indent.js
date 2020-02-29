module.exports = args => {
  if (args.length == 2) {
    return '<p class="no-indent"><a href="'+ args[1] +'" target="_blank">' + args[0] + '</a></p>'
  } else {
    return '<p class="no-indent">' + args[0] + '</p>';
  }
}