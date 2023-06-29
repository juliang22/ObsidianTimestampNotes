import express from "express";
import * as fs from "fs";
import * as mime from "mime-types";
import { Notice } from "obsidian";
import * as http from "http";
import { AddressInfo } from "node:net";
import languageEncoding from "detect-file-encoding-and-language";

export var server: http.Server = undefined;
export var PORT: number;
export var HOST = "127.0.0.1";

var localVideoRoute = "localvideo";
var subtitleRoute = "subtitles";

export function localVideoRedirect(url: string) {
  url = url.toString().replace(/^\"(.+)\"$/, "$1");
  return `http://${HOST}:${PORT}/${localVideoRoute}/${url}`;
}

export function subtitleRedirect(url: string) {
  url = url.toString().replace(/^\"(.+)\"$/, "$1");
  return `http://${HOST}:${PORT}/${subtitleRoute}/${url}`;
}

async function checkPort(port: number) {
  if (0 > port || port > 65536) return false;

  return new Promise((resolve) => {
    var req = http.get(`http://127.0.0.1:${port}`, function (res) {
      if (res.statusCode != 400) {
        resolve(null);
      }
    });
    req.on("error", function (e) {
      resolve(port);
    });
  });
}

export function startServer(port_: any) {
  return new Promise(async (res) => {
    var app: express.Application = express();
    server = app.listen(await checkPort(port_), function () {
      var server_adress = server.address() as AddressInfo;
      PORT = server_adress.port;
      console.log(`Port ${PORT} listening`);
      new Notice(port_ ? `Local server started on Port ${port_}` : `Port ${port_} is already used, local server started at port ${PORT}`);
      res(server);
    });

    app.get(`/${localVideoRoute}/*`, function (req, res) {
      // https://blog.logrocket.com/build-video-streaming-server-node/
      var path = decodeURI(req.url.split(`/${localVideoRoute}/`)[1]).replace(/^\"(.+)\"$/, "$1");
      var range = req.headers.range;

      if (!range) {
        range = "bytes=0-";
      }
      const videoSize = fs.statSync(path).size;

      const CHUNK_SIZE = 10 ** 6 * 4; // 4MB
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

      // Create headers
      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": mime.lookup(path) || "video/mp4",
        "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Origin": "app://obsidian.md",
      };

      // HTTP Status 206 for Partial Content
      res.writeHead(206, headers);

      // create video read stream for this particular chunk
      const videoStream = fs.createReadStream(path, { start, end });

      // Stream the video chunk to the client
      videoStream.pipe(res);
    });

    app.get(`/${subtitleRoute}/*`, async function (req, res) {
      var path = decodeURI(req.url.split(`/${subtitleRoute}/`)[1]).replace(/^\"(.+)\"$/, "$1");
      var srt_ = fs.readFileSync(path);
      var encoding = (await languageEncoding(path)).encoding;
      let decoder = new TextDecoder(encoding); // default 'utf-8' or 'utf8'
      var srt = decoder.decode(srt_);
      var vtt;
      if (path.endsWith(".srt")) {
        // https://github.com/mafintosh/srt-to-vtt/blob/8b0e4bac28f18694e741949c50a8cbf73cd7bb6e/index.js#L9
        vtt =
          "WEBVTT FILE\r\n\r\n" +
          srt
            .replace(/\{\\([ibu])\}/g, "</$1>")
            .replace(/\{\\([ibu])1\}/g, "<$1>")
            .replace(/\{([ibu])\}/g, "<$1>")
            .replace(/\{\/([ibu])\}/g, "</$1>")
            .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2")
            .replace(/(\d\d:\d\d:\d\d\.\d\d\d --> \d\d:\d\d:\d\d\.\d\d\d)/g, "$1 align:middle line:90%") // for using with audio player
            .concat("\r\n\r\n");
      } else if (path.endsWith(".vtt")) {
        vtt = srt;
      }

      const headers = {
        "Content-Type": "text/vtt",
        "Access-Control-Allow-Origin": "*",
      };
      res.writeHead(200, headers);
      res.end(vtt);
    });

  });
}
