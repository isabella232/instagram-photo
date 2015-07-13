# The Lob endpoint this demo was written for has since been deprecated.


## Install Dependancies
```
npm i
```

## Run the App
```
node app.js
```

## app.js
Here we define the basic server setup, and include our `instagram` component.


## instagram/index.js
Here we declare the routes and business logic for the functionality of our Instagram App


## instagram/config.js
Configuration for Lob API Keys and Instagram Credentials

```
var config = {
  lob_api_key: 'xxxxx',
  instagram_redirect_uri: 'http://localhost:3000/handleauth',
  instagram_client_id: 'xxxxxx',
  instagram_client_secret: 'xxxxx'
}
```

* [Lob Registration](https://dashboard.lob.com/#/register)
* [Instagram Registration](https://instagram.com/developer/?hl=en)


