import {effect, signal, Signal} from '@angular/core';

// @ts-ignore
export function computedAsync<T>(computation: () => Promise<T>, initialValue:T = undefined):Signal<T>{
  const reultSignal = signal<T>(initialValue);
  effect(async () => {
    reultSignal.set(await computation());
  },{allowSignalWrites:true});
  return reultSignal.asReadonly();
}
