type IBaseEvent = {
  eventType: string;
  uri: string;
  data?: any;
};

interface IClientState extends IBaseEvent {
  data: {
    action: IClientAction;
    components: [];
    id: string;
    isCorrupted: boolean;
    isStopped: boolean;
    isUpToDate: boolean;
    isUpdateAvailable: boolean;
    percentPatched: number;
  };
  eventType: string;
  uri: string;
}

type IClientAction =
  | 'Idle'
  | 'ChampSelect'
  | 'InGame'
  | 'PostChampSelect'
  | 'PostGame';

interface IChampSelectSessionEvent extends IBaseEvent {
  data: {
    actions: [IAction[]];
    allowBattleBoost: boolean;
    allowDuplicatePicks: boolean;
    allowLockedEvents: boolean;
    allowRerolling: boolean;
    allowSkinSelection: boolean;
    benchChampionIds: [];
    benchEnabled: boolean;
    boostableSkinCount: number;
    chatDetails: {
      chatRoomName: string;
      chatRoomPassword: string;
    };
    counter: number;
    entitledFeatureState: {
      additionalRerolls: number;
      unlockedSkinIds: [];
    };
    gameId: number;
    hasSimultaneousBans: boolean;
    hasSimultaneousPicks: boolean;
    isSpectating: boolean;
    localPlayerCellId: 3;
    lockedEventIndex: -1;
    myTeam: ITeamPlayer[];
    recoveryCounter: number;
    rerollsRemaining: number;
    skipChampionSelect: boolean;
    theirTeam: ITeamPlayer[];
    timer: {
      adjustedTimeLeftInPhase: number;
      internalNowInEpochMs: number;
      isInfinite: boolean;
      phase: string;
      totalTimeInPhase: number;
    };
    trades: [];
  };
  eventType: string;
  uri: string;
}

type IAction = {
  actorCellId: number;
  championId: number;
  completed: boolean;
  id: number;
  isAllyAction: boolean;
  isInProgress: boolean;
  type: 'ban';
};

type IActionType = 'ban' | 'pick' | 'ten_bans_reveal';

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
