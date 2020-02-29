const makeId = () => {
  return new Date().getTime().toString(16)  + Math.floor(1000*Math.random()).toString(16)
}

module.exports = (_, content) => {
  const accordionId = makeId()
  const titleId = `accordion--title-${accordionId}`
  const contentId = `accordion--content-${accordionId}`
  const style = `<style type='text/css'>#${titleId}:checked~#${contentId}{height:2.5em;padding:.5em;padding-left:1em;opacity:1;}</style>`
  const element = `<div class='accordion'><label class='accordion--title' for='${titleId}'>コメントアウト</label><input class='accordion--title-checkbox' id='${titleId}' type='checkbox' /><div class='accordion--content' id='${contentId}'>${content}</div></div>`
  return style+element
};