export interface JSONStorageIfc {
  removeItem(key: string): void;
  setItem(key: string, value: Jsonifiable): void;
}
