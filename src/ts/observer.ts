export interface Observer {
    update: (key: string) => void;
}

export interface Observable {
    registerObserver: (observer: Observer) => void;
    removeObserver: (observer: Observer) => void;
    notifyObservers: (key: string) => void;
}