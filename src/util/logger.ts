export default new class Logger {
  enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  wrapToggle(forceAs?: boolean) {
    const wasEnabled = this.enabled;
    const shouldDisable = !(forceAs ?? wasEnabled);
    if (forceAs === wasEnabled) return () => { };
    this.setEnabled(shouldDisable);
    return () => this.setEnabled(wasEnabled);
  }

  get wrap() {
    const self = this;
    return function (_t: any, _p: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        const restore = self.wrapToggle();
        const result = originalMethod.apply(this, args);
        restore();
        return result;
      };
      return descriptor;
    }
  }

  table(data: any, columns?: string[], force: boolean = false) {
    if (!this.enabled && !force) return;
    console.table(data, columns);
  }

  log(message: any, args?: any[], force: boolean = false) {
    if (this.enabled || force) console.log(message, ...(args || []));
  }

  info(message: any, args?: any[], force: boolean = false) {
    if (this.enabled || force) console.info(message, ...(args || []));
  }

  debug(message: any, args?: any[], force: boolean = false) {
    if (this.enabled || force) console.debug(message, ...(args || []));
  }

  warn(message: any, args?: any[], force: boolean = false) {
    if (this.enabled || force) console.warn(message, ...(args || []));
  }

  // Error has bypass for enabled
  error(message: string, args?: any[]) {
    console.error(message, ...(args || []));
  }
}