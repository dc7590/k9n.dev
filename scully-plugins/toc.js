const { registerPlugin } = require('@scullyio/scully');
const { logWarn, yellow } = require('@scullyio/scully/utils/log');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const tocPlugin = async (html, route) => {
  try {
    const dom = new JSDOM(html);
    const { window } = dom;
    const insertPoint = window.document.querySelector('#toc');

    // in case <div id="toc"></div> is not on the site
    if (!insertPoint) { return html; }

    // get h2 and h3 headings
    const headers = window.document.querySelectorAll('.blog-content>h2,.blog-content>h3');
    let previousTag = null;
    let toc = '';
    headers.forEach(c => {
      const baseLiEl = `<li><a href="${route.route}#${c.id}">${c.textContent}</a></li>`;
      if (c.tagName === 'H3' && previousTag === 'H2') {
        toc += '<ul style="margin-bottom: 0px">';
      }
      if (c.tagName === 'H2' && previousTag === 'H3') {
        toc += '</ul>';
      }
      toc += baseLiEl;
      previousTag = c.tagName;
    });
    
    // append toc title as child
    const tocTitle = (route.data.language && route.data.language.toLowerCase() === 'en') ? 'Table of contents' : 'Inhalt'
    const tocHeading = window.document.createElement('h2')
    tocHeading.innerHTML = tocTitle;
    insertPoint.appendChild(tocHeading)

    // append toc as child
    const list = window.document.createElement('ul');
    list.innerHTML = toc;
    insertPoint.appendChild(list)

    // return new serialized HTML
    return dom.serialize();
  } catch (e) {
    logWarn(`error in tocPlugin, didn't parse for route '${yellow(route.route)}'`);
  }
  // in case of failure return unchanged HTML to keep flow going
  return html;
};

const validator = async config => [];
registerPlugin('render', 'toc', tocPlugin, validator);