import React from 'react';
import { IChampionData } from './models';
import './App.css';

function getChampionIcon(id: number) {
    return `https://cdn.communitydragon.org/latest/champion/${id}/square.png`;
}

async function getChampionData(id: number): Promise<IChampionData> {
    const response = await fetch(
        `https://cdn.communitydragon.org/latest/champion/${id}/data`,
    );
    return await response.json();
}

function App() {
    const [bannedChampions, setBannedChampions] = React.useState<number[]>([]);
    const [teamPickedChampions, setTeamPickedChampions] = React.useState<
        number[]
    >([]);
    const [enemyPickedChampions, setEnemyPickedChampions] = React.useState<
        number[]
    >([]);

    (window as any).Api.on('bannedChampions', (message: any) => {
        console.log('bannedChampions', message);
        setBannedChampions(JSON.parse(message));
    });
    (window as any).Api.on('teamPickedChampions', (message: any) => {
        console.log('teamPickedChampions', message);
        setTeamPickedChampions(JSON.parse(message));
    });
    (window as any).Api.on('enemyPickedChampions', (message: any) => {
        console.log('teamPickedChampions', message);
        setEnemyPickedChampions(JSON.parse(message));
    });

    return (
        <div className="App">
            <div className="bans">
                <p>Bans</p>
                {bannedChampions.map(championId => (
                    <img
                        key={`bannedChampion${championId}`}
                        src={getChampionIcon(championId)}
                        alt={`championImgAlt${championId}`}
                    />
                ))}
            </div>
            <div className="picks">
                <div className="team">
                    <p>My team</p>
                    {teamPickedChampions.map(championId => (
                        <img
                            key={`teamPickedChampion${championId}`}
                            src={getChampionIcon(championId)}
                            alt={`championImgAlt${championId}`}
                        />
                    ))}
                </div>
                <div className="enemy">
                    <p>Enemy team</p>
                    {enemyPickedChampions.map(championId => (
                        <img
                            key={`enemyPickedChampion${championId}`}
                            src={getChampionIcon(championId)}
                            alt={`championImgAlt${championId}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
