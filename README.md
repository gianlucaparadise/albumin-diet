# Albumin Diet Engine

## Overview

Albumin Diet is an application that aims to make a music streaming platform (Spotify) less playlist-centric and more album oriented.
With Albumin Diet you can:

* Tag your saved albums with your custom-made tags
* Browse your saved albums by tag
* Save an album in your listening-list and listen to them later

## Try it

You can follow the instructions on the [web](https://github.com/gianlucaparadise/albumin-diet-portal) repository and on the [mobile-app](https://github.com/gianlucaparadise/albumin-diet-mobapp) repository.

**N.B.** This is intended to be a POC and is using a free DBaaS with limited storage available. All your data may be lost without warning.

## Ecosystem

Albumin Diet has born to test the capabilities of several technologies. The whole ecosystem is made of the following applications:

* [albumin-diet-engine](https://github.com/gianlucaparadise/albumin-diet-engine) (this repository)
  * Backend
* [albumin-diet-portal](https://github.com/gianlucaparadise/albumin-diet-portal)
  * Frontend Web
* [albumin-diet-mobapp](https://github.com/gianlucaparadise/albumin-diet-mobapp)
  * Frontend Mobile App

## Tech notes

I used this project to test the capabilities of the following technologies:

* MongoDB
* Express
* Typescript
* Node.js
* Jest (for unit testing)
* Vercel
* Spotify API

## Dev notes

To run this application locally, you need to perform the following steps:

1. Clone the repository

```sh
git clone https://github.com/gianlucaparadise/albumin-diet-engine && cd albumin-diet-engine
```

2. Install the dependencies

```sh
yarn install
```

3. Fill the example env file with your information
    * **N.B.** You may need to create a db on mLab.com

```sh
cp .example.env .env && vi .env # use your favorite editor instead of vi
```

4. Install `vercel` globally

```sh
yarn global add vercel
```

5. Run the server using `vercel`

```sh
vercel dev
```