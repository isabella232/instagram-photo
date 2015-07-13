var express       = require('express');
var cookieParser  = require('cookie-parser');
var instaApi      = require('instagram-node').instagram();
var fs            = require('fs');
var Bluebird      = require('bluebird');
var router        = express.Router();
var config        = require('./config');
var Lob           = require('lob')(config.lob_api_key);

Bluebird.promisifyAll(instaApi);


/* Index Page
 * IF the instagram cookie is present, show the app
 * ELSE show an Instagram login button
 */
router.get('/', function (req, res) {

  if (req.cookies.instaToken) {
    instaApi.use({ access_token: req.cookies.instaToken });
    return instaApi.user_self_media_recentAsync(50)
    .spread(function (medias, pagination, remaining, limit) {
      return instaApi.mediaAsync(medias[Math.floor(Math.random() * medias.length -1) + 1].id);
    })
    .then(function (image) {
      res.render('index', {
        image: image[0].images.standard_resolution.url
      });
    })
    .catch(function (errors) {
      console.log(errors);
    });
  } else {
    res.render('index', {
      showLogin: true
    });
  }
});


/* Redirect user to Instagram for authentication */
router.get('/authorize-user', function (req, res) {
  instaApi.use({
    client_id: config.instagram_client_id,
    client_secret: config.instagram_client_secret
  });
  res.redirect(instaApi.get_authorization_url(config.instagram_redirect_uri));
});


/* Set cookie once Instagram sends access code */
router.get('/handleauth', function (req, res) {
  instaApi.authorize_userAsync(req.query.code, config.instagram_redirect_uri)
  .then(function (result) {
    res.cookie('instaToken',result.access_token, { maxAge: 900000, httpOnly: true });
    res.redirect('/');
  })
  .catch(function (errors) {
    console.log(errors);
  });
});


/* Create Photo and Send to Lob */
router.post('/send-photo', function (req, res) {

  var photoTemplate = fs.readFileSync(__dirname + '/photo.html').toString();
  return Lob.addresses.create({
    name: req.body.name,
    address_line1: req.body.address,
    address_city: req.body.city,
    address_state: req.body.state,
    address_zip: req.body.zip,
    address_country: 'US',
  })
  .then(function (address) {
    return Lob.jobs.create({
      description: 'Instagram Photo',
      to: address.id,
      from: address.id,
      objects: [{
        file: photoTemplate,
        data: { image: req.body.image },
        setting: 503
      }]
    });
  })
  .then(function (results) {
    res.render('complete', { url: results.objects[0].url });
  })
  .catch(function (errors){
    res.render('complete', { error: errors.message });
  });

})



module.exports = router;