[![Build Status](https://travis-ci.org/cultuurnet/udb3-angular.svg)](https://travis-ci.org/cultuurnet/udb3-angular)
[![Coverage Status](https://coveralls.io/repos/cultuurnet/udb3-angular/badge.svg)](https://coveralls.io/r/cultuurnet/udb3-angular)

This project holds all the necessary angular recipes, styles and templates to
 create an UDB3 front-end.

## Usage

You can use bower to manage any dependencies on this project. Navigate to your bower project and the following
 command:
`bower install --save cultuurnet/udb3-angular`

If you are using [wiredep](https://github.com/taptapship/wiredep) to include all of your bower modules,
 **udb3-angular.js** and **udb3-angular.css** will be automatically included. You can find them in the dist folder
  together with a minified version if you want to include them manually.

The .css you get out of the box is based on Bootstrap and uses the default variables. You can make the styling blend
 in with your custom bootstrap theme by using the .less files in the 'src/styles' folder.
 
### Configuration

Inject the `udb.core` module into your app module like this:

```javascript
angular
  .module('myUdbApp', [
    'udb.core',
  ])
  .config(udbAppConfig)
  .run(function (udbApi) {
    udbApi.getMe();
  });
```

And use the following config to get you up and running.

```javascript
function udbAppConfig($translateProvider, queryFieldTranslations, dutchTranslations, uiSelectConfig) {
  // Translation configuration
  var defaultTranslations = _.merge(dutchTranslations, queryFieldTranslations.nl);

  $translateProvider
    .translations('nl', defaultTranslations)
    .preferredLanguage('nl');
  // end of translation configuration

  uiSelectConfig.theme = 'bootstrap';
}
```

### Directives

Directives are always prefixed with `udb-` and usable as elements, e.g.:
`<udb-directive-name></udb-directive-name>`.

#### Search bar

#### Search

## Development

This [AngularJS Style Guide](https://github.com/johnpapa/angularjs-styleguide) was used for the project.

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install global dev dependencies: `npm install -g bower grunt-cli`
* Install local dev dependencies: `npm install && bower install` in repository directory

### Test and build
`grunt build` and `grunt test`
