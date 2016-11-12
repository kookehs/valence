export class DebugUtility {
  // Only log messages within the following filter will be shown
  static filter: string[] = ['info', 'error'];
  // Only log messages with levels greater than threshold will be shown
  // A threshold of 0 will log all messages
  static threshold: number = 0;

  static log(level: number, category: string, message: string) {
    if (DebugUtility.threshold == 0 || level > DebugUtility.threshold) {
      if (DebugUtility.filter.indexOf(category) in DebugUtility.filter) {
        console.log('[' + level + '] [' + category + '] ' + message);
      }
    }
  }
}
