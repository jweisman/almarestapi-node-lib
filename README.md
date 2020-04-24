# Alma REST API Node Library

This library makes it easy to call the Ex Libris Alma REST APIs in Node.js.

## Installation
`npm install almarestapi-lib --save` 

## API Key
The library expects that the API key be available in an environment variable called `ALMA_APIKEY`. The API host can be optionally stored in an environment variable called `ALMA_APIHOST`. The defaut is https://api-na.hosted.exlibrisgroup.com/almaws/v1.

You can call your script with the API key in the command line, as follows:
```
ALMA_APIKEY=l7xxabcdefghijklmnopqrstuvwxyz node test.js 
```

## Usage
To being using the library, require it at the top of your Node file:
```
var alma = require ('almarestapi-lib');
```

### Async/Await
The library supports usage of `async/await`. The functions which return a Promise end in the letter 'p', i.e. `getp`.
```
var alma = require ('almarestapi-lib');

async function main() {
  try {
    console.log(await alma.getp('/users/joshw?view=brief'));
  } catch (e) {
    console.error('ERROR: ', e.message);
  }
}

main();
```

## Working with JSON
The following functions work with JSON:

*Retrieving JSON with `getp`*
```
await alma.getp('/users/joshw?view=brief');
```
*Updating JSON with `putp`*
```
var user = await alma.getp('/users/joshw');
user.middle_name = 'Max';
console.log(await alma.putp('/users/joshw', user);
```
*Creating a record with `postp`*
```
var user = { first_name: 'Josh', last_name: 'Testman', account_type:{value: 'INTERNAL'}};
console.log(await alma.postp('/users', user));
```

*Deleting with `deletep`*
```
alma.deletep('/users/4101979450000561');
```

## Working with XML
It is preferable to work with XML when calling APIs which relate to BIB records. You can use the XML functions to work with these APIs.

*Retrieving a BIB record with `getXmlp`*
```
var bib = await alma.getXmlp('/bibs/9981140900561');
```

*Updating and creating a BIB record*
You can use the `putXmlp` and `postXmlp` functions to update and create BIB records respectively.
```
var dom        = require('xmldom').DOMParser;
var xpath      = require('xpath');
const XPATH_TITLE = '/bib/record/datafield[@tag="245"]/subfield[@code="a"]';

var bib = await alma.getXmlp('/bibs/991439870000541');
bib = new dom().parseFromString(bib);
xpath.select(XPATH_TITLE, bib)[0]
  .firstChild.data='History curatorship';
console.log(await alma.putXmlp('/bibs/991439870000541', bib));      
```

## Issues
Feel free to report issues in this repository.
