const createDOMPurify = require('dompurify');
const {
  JSDOM
} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


function sanitize(input, allowed_tags) {
  if (allowed_tags === undefined) {
    allowed_tags = []
  }

  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: allowed_tags
  });
}

function sanitizeMessage(input) {
  return sanitize(input, ['b', 'i'])
}

module.exports = {
  sanitize,
  sanitizeMessage
}