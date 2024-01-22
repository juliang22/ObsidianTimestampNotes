import { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Options } from "http-proxy-middleware/dist/types";
import * as https from "https";
import { PORT, HOST } from "./server";
import xml from "xml";

const biliUrlPattern = /(bilibili\.com\/(video\/)?(((av\d{8})|(bv[A-Za-z0-9}]{10}))(\?|\/)?))|(b23\.tv\/([A-Za-z0-9]{6}|[A-Za-z0-9]{12})$)/i;

var dashBaseUrlRoute = "biliRedirect";
var mpdRoute = "biligetmpd";
var biliSubRoute = "bilisubtovtt";

export function isBiliUrl(url: string) {
  if (biliUrlPattern.test(url)) {
    return true;
  } else {
    return false;
  }
}

function redirect_b23(url: string) {
  return new Promise<string>((resolve) => {
    https.get((/^(https|http):\/\//.test(url) ? "" : "https://") + url, { method: "HEAD" }, async (res) => {
      resolve(res.headers.location);
    });
  });
}

// https://github.com/1015770492/bilibili-download/blob/master/doc/bilibili-Api%E6%96%87%E6%A1%A3.md
export function getBiliInfo(url: string) {
  return new Promise<{ url: string; subtitles: object[] }>(async (res) => {
    if (/b23\.tv\/([A-Za-z0-9]{6})/.test(url)) {
      url = (await redirect_b23(url)).toString();
    }

    var api_view_params;
    if (url.match(/\/bv[A-Za-z0-9}]{10}/gi)) {
      api_view_params = { bvid: url.match(/\/bv[A-Za-z0-9}]{10}/gi)[0].slice(1) };
    } else if (url.match(/\/av\d{8}/gi)) {
      api_view_params = { aid: url.match(/\/av\d{8}/gi)[0].slice(3) };
    }
    var page_number = url.match(/(?<=\?p=)\d+/i)?.[0] || "1";

    var api_view_url = "https://api.bilibili.com/x/web-interface/view";
    var cid_res = await (await fetch(biliUrlProxy(`${api_view_url}?${new URLSearchParams(api_view_params)}`))).json();

    var page = cid_res.data.pages.find((p: any) => p.page == page_number);
    var cid = page.cid;

    var params = { bvid: api_view_params.bvid || cid_res.data.bvid, cid: cid };

    var subtitles: any[] = [];
    var subArr: any[];
    if (page_number !== "1") {
      var new_res = await (await fetch(biliUrlProxy(`${api_view_url}?${new URLSearchParams(params)}`))).json();
      subArr = new_res.data.subtitle.list;
    } else {
      subArr = cid_res.data.subtitle.list;
    }
    subArr.forEach((sub, i) => {
      subtitles.push({
        kind: "subtitles",
        src: `http://${HOST}:${PORT}/${biliSubRoute}/subtitle_url=${sub.subtitle_url}`,
        srcLang: sub.lan,
        label: sub.lan,
        default: i == 0 ? true : false,
      });
    });

    res({
      url: `http://${HOST}:${PORT}/${mpdRoute}/${new URLSearchParams(params)}.mpd`,
      subtitles: subtitles,
    });
  });
}

var biliUrlProxy = (url: string) => {
  return `http://${HOST}:${PORT}/${dashBaseUrlRoute}/` + new URL(url).host + new URL(url).pathname + new URL(url).search;
};

function getDash(params: object) {
  return new Promise<string>(async (res) => {
    const api_playurl_url = "https://api.bilibili.com/x/player/playurl";
    var api_playurl_params = {
      ...params,
      fnval: "16",
      qn: "64",
      fnver: "0",
      fourk: "1",
    };


    var dash_res = await (await fetch(biliUrlProxy(`${api_playurl_url}?${new URLSearchParams(api_playurl_params)}`))).json();
    var dash = dash_res.data.dash;

    var video = [];
    var audio = [];

    for (const key in dash.video) {
      if (Object.hasOwnProperty.call(dash.video, key) && dash.video[key].codecs.startsWith("av")) {
        const e = dash.video[key];
        var video_xml_obj = {
          Representation: [
            {
              _attr: {
                id: e.id,
                bandwidth: e.bandwidth,
                mimeType: e.mimeType,
                codecs: e.codecs,
                width: e.width,
                height: e.height,
                frameRate: e.frameRate,
                sar: e.sar,
                startWithSap: e.startWithSap,
                codecid: e.codecid,
              },
            },
            {
              BaseURL: biliUrlProxy(e.baseUrl),
            },
            {
              SegmentBase: [
                {
                  _attr: {
                    indexRange: e.SegmentBase.indexRange,
                    Initialization: e.SegmentBase.Initialization,
                  },
                },
              ],
            },
          ],
        };
        video.push(video_xml_obj);
      }
    }
    for (const key in dash.audio) {
      if (Object.hasOwnProperty.call(dash.audio, key)) {
        const e = dash.audio[key];

        var audio_xml_obj = {
          Representation: [
            {
              _attr: {
                id: e.id,
                bandwidth: e.bandwidth,
                mimeType: e.mimeType,
                codecs: e.codecs,
                startWithSap: e.startWithSap,
                codecid: e.codecid,
              },
            },
            {
              BaseURL: biliUrlProxy(e.baseUrl),
            },
            {
              SegmentBase: [
                {
                  _attr: {
                    indexRange: e.SegmentBase.indexRange,
                    Initialization: e.SegmentBase.Initialization,
                  },
                },
              ],
            },
          ],
        };
        audio.push(audio_xml_obj);
      }
    }
    var xmlArr = [
      {
        MPD: [
          {
            _attr: {
              xmlns: "urn:mpeg:dash:schema:mpd:2011",
              profiles: "urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264",
              type: "static",
              minBufferTime: `PT${dash.minBufferTime}S`,
              mediaPresentationDuration: `PT${dash.duration}S`,
            },
          },
          {
            Period: [
              {
                _attr: {
                  duration: `PT${dash.duration}S`,
                },
              },
              {
                AdaptationSet: [
                  {
                    _attr: {
                      contentType: "video",
                      bitstreamSwitching: "true",
                    },
                  },
                  ...video,
                ],
              },
              {
                AdaptationSet: [
                  {
                    _attr: {
                      contentType: "audio",
                      bitstreamSwitching: "true",
                    },
                  },
                  ...audio,
                ],
              },
            ],
          },
        ],
      },
    ];
    var xml_ = xml(xmlArr, true);
    res(xml_);
  });
}

// https://github.com/aidenlx/mx-bili-plugin/blob/master/src/fake-bili/proxy/fake.ts
export function biliRedirects(app: Application) {
  var user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0";

  const options: Options = {
    target: "http://www.example.org",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      [`^/${dashBaseUrlRoute}/.+?/`]: "/",
    },
    router: (req) => {
      return "https://" + req.params.host;
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("user-agent", user_agent);
      proxyReq.setHeader("referer", "https://www.bilibili.com/");
      proxyReq.setHeader("origin", "https://www.bilibili.com/");
    },
    onProxyRes: (proxyRes) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
  };

  app.use(`/${dashBaseUrlRoute}/:host`, createProxyMiddleware(options));

  app.get(`/${mpdRoute}/*`, async (req, res, next) => {
    var params: any = decodeURI(req.url.split(`/${mpdRoute}/`)[1]).slice(0, -4);
    params = Object.fromEntries(new URLSearchParams(params));
    var mpd = await getDash(params);
    res.writeHead(200, {
      "Content-Type": "application/dash+xml",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(mpd);
  });

  app.get(`/${biliSubRoute}/*`, async function (req, res) {
    var params: any = decodeURI(req.url.split(`/${biliSubRoute}/`)[1]);
    params = Object.fromEntries(new URLSearchParams(params));

    var sub_url = params.subtitle_url;
    if (!params.subtitle_url) {
      var params_str = new URLSearchParams((({ index, ...o }) => o)(params)).toString();

      var api_view_url = "https://api.bilibili.com/x/web-interface/view";
      var fetch_url = biliUrlProxy(`${api_view_url}?${params_str}`);
      var list_res = await (await fetch(fetch_url)).json();

      sub_url = list_res.data.subtitle.list[params.index].subtitle_url;
    }


    var str = "";
    var subjson = (await (await fetch(sub_url)).json()).body;
    for (let i = 0; i < subjson.length; i++) {
      const sub = subjson[i];
      var fromtime = new Date(sub.from * 1000).toISOString().slice(11, 23);
      var totime = new Date(sub.to * 1000).toISOString().slice(11, 23);
      str += `${i + 1}\n`;
      str += `${fromtime} --> ${totime}\n`;
      str += `${sub.content}\n\n`;
    }
    var vtt = "WEBVTT FILE\r\n\r\n" + str;
    const headers = {
      "Content-Type": "text/vtt",
      "Access-Control-Allow-Origin": "*",
    };
    res.writeHead(200, headers);
    res.end(vtt);
  });
}
