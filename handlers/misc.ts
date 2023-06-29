import * as fs from "fs";
import ReactPlayer from "react-player";

export function cleanUrl(url: string) {
  var urlregex = new RegExp(
    /((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})|http:\/\/127\.0\.0\.1:[0-9]|http:\/\/localhost:[0-9])[^\s]+/gi
  );
  if (url.match(urlregex)) {
    url = url.match(urlregex)[0].toString();
    url = /^[https|http]/.test(url) ? url : "https://" + url;
  }
  return url;
}

export function isLocalFile(path: fs.PathLike) {
  var cleanpath = path.toString().replace(/^\"(.+)\"$/, "$1"); // for removing quotes from links copied via "copy as path" in windows
  if (fs.existsSync(cleanpath)) {
    return true;
  } else {
    return false;
  }
}
export function isSameVideo(reactplayer: any, lastLine: string) {
  if (!reactplayer) return false;

  lastLine = lastLine.toString().replace(/^\"(.+)\"$/, "$1");
  var url = reactplayer?.props?.main_url || reactplayer?.props?.url;
  if (!url) return false;
  if (url.includes(lastLine) || lastLine.includes(url)) {
    return true;
  }

  var player = reactplayer.getInternalPlayer();

  // youtube id
  if (player?.playerInfo) {
    if (lastLine.includes(player.playerInfo?.videoData?.video_id)) {
    }
    return true;
  }

  var same = false;
  var patterns = [
    // node_modules/react-player/lazy/patterns.js
    /vimeo\.com\/(?!progressive_redirect).+/,
    /^https?:\/\/(www\.)?facebook\.com.*\/(video(s)?|watch|story)(\.php?|\/).+$/,
    /^https?:\/\/fb\.watch\/.+$/,
    /streamable\.com\/([a-z0-9]+)$/,
    /(?:wistia\.(?:com|net)|wi\.st)\/(?:medias|embed)\/(?:iframe\/)?(.*)$/,
    /(?:www\.|go\.)?twitch\.tv\/videos\/(\d+)($|\?)/,
    /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/,
    /^(?:(?:https?):)?(?:\/\/)?(?:www\.)?(?:(?:dailymotion\.com(?:\/embed)?\/video)|dai\.ly)\/([a-zA-Z0-9]+)(?:_[\w_-]+)?$/,
    /mixcloud\.com\/([^/]+\/[^/]+)/,
    /vidyard.com\/(?:watch\/)?([a-zA-Z0-9-_]+)/,
    /^https?:\/\/[a-zA-Z]+\.kaltura.(com|org)\/p\/([0-9]+)\/sp\/([0-9]+)00\/embedIframeJs\/uiconf_id\/([0-9]+)\/partner_id\/([0-9]+)(.*)entry_id.([a-zA-Z0-9-_].*)$/,
    //https://gist.github.com/TrevorJTClarke/a14c37db3c11ee23a700
    /https?:\/\/(?:w\.|www\.|)(?:soundcloud\.com\/)(?:(?:player\/\?url=https\%3A\/\/api.soundcloud.com\/tracks\/)|)(((\w|-)[^A-z]{7})|([A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*(?!\/sets(?:\/|$))(?:\/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*){1,2}))/,
  ];
  patterns.forEach((pattern) => {
    var id = url.match(pattern)?.[1] || null;
    if (pattern.test(lastLine) && new RegExp(id).test(lastLine)) {
      same = true;
    }
  });
  return same;
}
