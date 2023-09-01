"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WINDOW_RESOLUTION = exports.ALLOWED_FILE_TYPES_MIME = exports.ALLOWED_FILE_TYPES = exports.STORE_KEYS = exports.EVENTS = void 0;
exports.EVENTS = {
    ELECTRON_STORE_GET: "electronStoreGet",
    ELECTRON_STORE_SET: "electronStoreSet",
    LINK_WITH_TELEGRAM: "linkWithTelegram",
    SERVER_CONNECTED: "serverConnected",
    BOT_STAGE_CHANGED: "botStageChanged",
    MEDIA_STATE: "mediaStateEvent",
    CONNECT_TO_DEVICE: "connectToDevice",
    DISCONNECT_FROM_DEVICE: "disconnectFromDevice",
    DEVICE_CONNECTED: "deviceConnected",
    DEVICE_CONNECTION_ERROR: "deviceConnectionError",
    DEVICE_DISCONNECTED: "deviceDisconnected",
    DEVICE_DISCONNECTED_ERROR: "deviceDisconnectedError",
    CAST_STARTED: "castStarted",
    CAST_START_ERROR: "castStartError",
    CAST_STOPPED: "castStopped",
    CAST_STOP_ERROR: "castStopError",
    SUBTITLES_REMOVED: "subtitlesRemoved",
    SUBTITLES_SHOWED: "subtitlesShowed",
    SUBTITLE_CHANGE_FONT_SCALE: "subtitleChangeFontScale",
    GET_DEVICES: "getDevices",
    CAST_LOCAL_FILE: "castLocalFile",
    PLAY_LOCAL_FILE: "playLocalFile",
    PAUSE_LOCAL_FILE: "pauseLocalFile",
    STOP_CAST_LOCAL_FILE: "stopCastLocalFile",
    SERVER_ON_CONNECTION: "connection",
    SOCKET_ON_CONNECT: "connect",
    SOCKET_ON_DISCONNECT: "disconnect",
    SOCKET_ON_CONNECT_ERROR: "connect_error",
    COMMAND: "command",
    TELEGRAM_ID: "telegram-id",
    STAGE: "stage",
};
exports.STORE_KEYS = {
    SERVER_CONNECTED: "serverConnected",
    LINK_WITH_TELEGRAM: "linkWithTelegram",
    TELEGRAM_ID: "telegramId",
    ID: "id",
};
exports.ALLOWED_FILE_TYPES = [".mp4", ".wav", ".webm", ".mp3"];
exports.ALLOWED_FILE_TYPES_MIME = [
    "video/mp4",
    "audio/wav",
    "audio/mpeg",
    "video/webm",
    "audio/mpeg",
];
exports.WINDOW_RESOLUTION = {
    WIDTH: 684,
    HEIGHT: 470,
    WIDTH_DEV: 1200,
    HEIGHT_DEV: 1000,
};
