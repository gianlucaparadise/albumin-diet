# spotify-web-api-node-typings

## Description

This package aims to map all the responses in [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node) npm package.
This is based on the work by [Niels Kristian Hansen Skovmand](https://github.com/skovmand/spotify-web-api-typings).
This is currently published from a yarn workspace inside the [Albumin Diet repository](https://github.com/gianlucaparadise/albumin-diet).

## Usage

`yarn add -D spotify-web-api-node-typings`

or

`npm add --dev spotify-web-api-node-typings`

## TODO

* Publish module augmentation in [spotify-web-api-node.d.ts](https://github.com/gianlucaparadise/albumin-diet/blob/master/src/types/spotify-web-api-node.d.ts)
  * Add missing methods to the `SpotifyWebApi` class
* Publish the typings as a separate repository instead of a yarn workspace of the [Albumin Diet repository](https://github.com/gianlucaparadise/albumin-diet)
* Send the typings to [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped#how-can-i-contribute) to make them public under `@types` scope