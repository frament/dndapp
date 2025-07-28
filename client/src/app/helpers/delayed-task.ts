const delayedTaskMarks = new Map<string, number>();

export function delayedTask(handler: () => void|Promise<void>, timeout:number, mark:string):void {
  delayedTaskMarks.set(mark, new Date().getTime());
  setTimeout(async () => {
    if (new Date().getTime() - (delayedTaskMarks.get(mark) ?? 0) >= timeout){
      await handler();
      delayedTaskMarks.delete(mark);
    }
  }, timeout);
}




