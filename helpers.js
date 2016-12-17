


function hbsHelpers(hbs) {
  return hbs.create({
  	defaultLayout:'layout',
    helpers: { // This was missing
      images: function(value, options) {
        console.log('reading it');
        return parseInt(value) + 1;
      }

      // More helpers...
    }

  });
}

module.exports = hbsHelpers;