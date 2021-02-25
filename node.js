import Aria2 from "./lib/Aria2.js";

import WebSocket from "ws";
import fetch from "node-fetch";

Aria2.defaultOptions.WebSocket = WebSocket;
Aria2.defaultOptions.fetch = fetch;

export default Aria2;
