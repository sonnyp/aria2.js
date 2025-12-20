import Aria2 from "./src/Aria2.js"; // or "aria2" if installed with npm
import debug from "./src/debug.js";

const aria2 = new Aria2();
debug(aria2);

await aria2.open(); // comment to use HTTP

aria2.addEventListener("onDownloadStart", ({ detail }) => {
  console.log("Download start", detail);
});

const magnet =
  "magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E&dn=bbb_sunflower_1080p_30fps_normal.mp4&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&ws=http%3a%2f%2fdistribution.bbb3d.renderfarming.net%2fvideo%2fmp4%2fbbb_sunflower_1080p_30fps_normal.mp4";
const guid = await aria2.call("addUri", [magnet], { dir: "/tmp" });

console.log("guid", guid);
