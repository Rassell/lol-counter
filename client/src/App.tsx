import React from 'react';
import { IChampionData } from './models';
import './App.css';

type ITeamPlayer = {
    assignedPosition: IPosition;
    cellId: number;
    championId: number;
    championPickIntent: number;
    entitledFeatureType: string;
    playerType: string;
    selectedSkinId: number;
    spell1Id: number;
    spell2Id: number;
    summonerId: number;
    team: number;
    wardSkinId: number;
};

type IPosition = 'middle' | 'top' | 'jungle' | 'bottom' | 'utility';

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
        ITeamPlayer[]
    >([]);
    const [enemyPickedChampions, setEnemyPickedChampions] = React.useState<
        ITeamPlayer[]
    >([]);

    (window as any).Api.on('bannedChampions', (message: any) => {
        console.log('bannedChampions', message);
        setBannedChampions(message);
    });
    (window as any).Api.on('teamPickedChampions', (message: any) => {
        console.log('teamPickedChampions', message);
        setTeamPickedChampions(message);
    });
    (window as any).Api.on('enemyPickedChampions', (message: any) => {
        console.log('teamPickedChampions', message);
        setEnemyPickedChampions(message);
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
                    {teamPickedChampions.map(pick => (
                        <img
                            key={`teamPickedChampion${pick.championId}`}
                            src={getChampionIcon(pick.championId)}
                            alt={`championImgAlt${pick.championId}`}
                        />
                    ))}
                </div>
                <div className="enemy">
                    <p>Enemy team</p>
                    {enemyPickedChampions.map(pick => (
                        <img
                            key={`enemyPickedChampion${pick.championId}`}
                            src={getChampionIcon(pick.championId)}
                            alt={`championImgAlt${pick.championId}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
