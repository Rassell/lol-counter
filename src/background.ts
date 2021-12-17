import fs = require('fs');
import { exec } from 'child_process';
import { app } from 'electron';
import { client as WebSocketClient } from 'websocket';

let bannedChampions: number[] = [];
let pickedChampions: number[] = [];

let connected = false;
let mainWindow: Electron.BrowserWindow;

export function setMainWindow(win: Electron.BrowserWindow) {
    mainWindow = win;
}

// Avoid issues with LOL SSL certificate
var client = new WebSocketClient({
    tlsOptions: { rejectUnauthorized: false },
});

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection) {
    connected = true;

    connection.on('error', function (error) {
        console.log('Connection Error: ' + error.toString());
    });

    connection.on('close', function () {
        app.exit();
    });

    connection.on('message', function (message) {
        // If is a event
        if (message.type === 'utf8') {
            const baseEvent: any[] = JSON.parse(message.utf8Data);

            // Check that are events that we want to catch
            if (baseEvent.length !== 3) return;
            if (baseEvent[0] !== 8 || baseEvent[1] !== 'OnJsonApiEvent') return;

            // Parse event data to baseEvent
            const parsedEvent: IBaseEvent = baseEvent[2];

            // ignore some events for now
            if (
                parsedEvent.uri.includes('/lol-champions/v1/inventories/') ||
                parsedEvent.uri.includes(
                    '/lol-champ-select/v1/all-grid-champions',
                ) ||
                parsedEvent.uri.includes('/lol-chat/v1/conversations/') ||
                parsedEvent.uri.includes('/lol-settings/v2/local/GeoInfo') ||
                parsedEvent.uri.includes('/lol-gameflow/v1/session') ||
                parsedEvent.uri.includes(
                    '/lol-platform-config/v1/namespaces',
                ) ||
                parsedEvent.uri.includes('/lol-chat/v1/blocked-players') ||
                parsedEvent.uri.includes('/lol-catalog/v1/items/EMOTE') ||
                parsedEvent.uri.includes(
                    '/lol-catalog/v1/items/CHAMPION_SKIN',
                ) ||
                parsedEvent.uri.includes(
                    '/lol-champ-select/v1/skin-carousel-skins',
                ) ||
                parsedEvent.uri.includes(
                    '/lol-champ-select/v1/grid-champions/',
                ) ||
                parsedEvent.uri.includes('/lol-matchmaking/v1/search') ||
                parsedEvent.uri.includes('/lol-content-targeting/v1/filters')
            )
                return;

            fs.writeFile(
                './lol_log.txt',
                JSON.stringify(parsedEvent) + '\r\n',
                { flag: 'a+' },
                err => err && console.log(err),
            );

            if (
                parsedEvent.uri.includes(
                    '/lol-lobby-team-builder/champ-select/v1/bannable-champion-ids',
                )
            ) {
                bannedChampions = [];
                pickedChampions = [];
            }

            // refresh token
            // /lol-league-session/v1/league-session-token
            // Current summoner
            // /lol-summoner/v1/current-summoner
            // Champions owned
            // /lol-champions/v1/owned-champions-minimal
            // Champion select
            if (
                parsedEvent.uri.includes(
                    '/lol-lobby-team-builder/champ-select/v1/session',
                ) &&
                parsedEvent.data
            ) {
                const champSelectSessionEvent: IChampSelectSessionEvent =
                    parsedEvent;

                // bans
                const bans = champSelectSessionEvent.data.actions[0] || [];
                bannedChampions = bannedChampions.concat(
                    bans
                        .filter(
                            b =>
                                b.completed &&
                                !bannedChampions.includes(b.championId),
                        )
                        .map(b => b.championId),
                );

                // picks
                const picks = champSelectSessionEvent.data.actions[2] || [];
                pickedChampions = pickedChampions.concat(
                    picks
                        .filter(
                            b =>
                                b.completed &&
                                !pickedChampions.includes(b.championId),
                        )
                        .map(b => b.championId),
                );

                console.log({ bans, bannedChampions, picks, pickedChampions });
                mainWindow.webContents.send(
                    'bannedChampions',
                    JSON.stringify(bannedChampions),
                );
                mainWindow.webContents.send(
                    'pickedChampions',
                    JSON.stringify(pickedChampions),
                );
            }
        }
    });

    function subscribe() {
        if (connection.connected) {
            connection.sendUTF('[5,"OnJsonApiEvent"]');
        }
    }

    subscribe();
});

setInterval(
    () => {
        // Execute command to get LoL connections
        if (!connected)
            exec(
                "wmic PROCESS WHERE name='LeagueClientUx.exe' GET commandline",
                (err, stdout, stderr) => {
                    // If there is no LoL open ignore
                    // TODO: Open lol?
                    if (err || stderr) {
                        return;
                    }

                    // Regexs to get LoL token and port
                    const pass = RegExp('"--remoting-auth-token=(.+?)"').exec(
                        stdout,
                    )[1];
                    const port = RegExp('"--app-port=(\\d+?)"').exec(stdout)[1];

                    // Connect to LoL
                    client.connect(
                        `wss://127.0.0.1:${port}/`,
                        'wamp',
                        undefined,
                        {
                            authorization:
                                'Basic ' +
                                Buffer.from(`riot:${pass}`).toString('base64'),
                        },
                    );
                },
            );
    },
    !connected ? 1000 : Number.MAX_SAFE_INTEGER,
);
