# Monetha Reputation Widget - Reputation Passport data from blockchain

The following example app purpose is to show how Reputation Passport can be read using a helper [reputation js sdk](https://github.com/monetha/reputation-js-sdk). More about Reputation Passport can be found in [Monetha - Reputation Layer documentation](https://github.com/monetha/reputation-layer)

This example is based on a reputation widget that Monetha user's get when they agree to publish their profiles. A [reputation widget](https://www.monetha.io/reputation-widgets) is one of the multiple features that we offer in our Monetha Platform. Though reputation widgets are available to user's who didn't create a Passport. The example below will show you how we retrieve data for users who did create the Passport.

In order to achieve the following we leverage [reputation js sdk](https://github.com/monetha/reputation-js-sdk). You can read more about Monetha Reputation Layer implementation in our [Github repo](https://github.com/monetha/reputation-layer)

## Setup & Run

After cloning the repository you will need to install the dependencies.

    npm install

After dependency installation is completed you can start the app with default configuration.

    npm start

This will run a local node.js server and serve the app on http://localhost:3000. First load might take some time due to building devDependencies for debugging purpose.

After application has loaded you should see an input box for entering a passport address. After entering a passport a passport address and clicking "Submit" information will be retrieved from blockchain and a reputation widget will be rendered.

## Implementation