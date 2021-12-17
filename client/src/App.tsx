import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [pickedChampions, setPickedChampions] = React.useState<number[]>([]);
    const [bannedChampions, setBannedChampions] = React.useState<number[]>([]);

    (window as any).Api.on('bannedChampions', (message: any) => {
        setBannedChampions(JSON.parse(message));
    });
    (window as any).Api.on('pickedChampions', (message: any) => {
        setPickedChampions(JSON.parse(message));
    });

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <ul>
                    {bannedChampions.map(championId => (
                        <li key={championId}>{championId}</li>
                    ))}
                </ul>
                <ul>
                    {pickedChampions.map(championId => (
                        <li key={championId}>{championId}</li>
                    ))}
                </ul>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer">
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
