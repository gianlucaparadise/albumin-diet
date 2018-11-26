import mongoose from "mongoose";

export type AlbumModel = mongoose.Document & {
  name: string,
  id: {
    spotify: string
  },
  url: {
    spotify: string
  },
  cover: {
    spotify: string
  },
  info: {
    releaseYear: string
  },
  artist: {
    name: string
  }
};

const albumSchema = new mongoose.Schema({
  name: String,
  id: {
    spotify: String
  },
  url: {
    spotify: String
  },
  cover: {
    spotify: String
  },
  info: {
    releaseYear: String
  },
  artist: {
    name: String
  }
}, { timestamps: true });

const Album = mongoose.model("Album", albumSchema);
export default Album;
