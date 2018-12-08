# Albumin diet

Albumin diet is an application that aims to make a music streaming platform (Spotify) less playlist-centric and more album oriented.
With Albumin diet you can:

* Tag your saved albums with your custom-made tags
* Browse your saved albums by tag

# Tech notes

Albumin diet is built using MongoDB + Node.js + Typescript.

# Dev notes

If `yarn build` fails, run:

```shell
rm -r ./node_modules/@types/connect-mongo/node_modules
```
