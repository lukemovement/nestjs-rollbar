import { IRollbarOptions, RollbarHandler } from "./rollbar.decorator";

export const RollbarClassHandler = (
  options: IRollbarOptions = {},
): ClassDecorator => {
  return ((target: new (...args: unknown[]) => unknown): never => {
    const methodDecorator = RollbarHandler(options);
    const methods = Object.getOwnPropertyNames(target.prototype);

    methods.forEach((method) => {
      if (method !== "constructor") {
        const originalMethod = target.prototype[method];

        const descriptor = Object.getOwnPropertyDescriptor(
          target.prototype,
          method,
        );

        if (!descriptor) {
          return;
        }

        if ("function" !== typeof descriptor.value) {
          return;
        }

        if (!Reflect.getMetadataKeys(originalMethod).includes("method")) {
          return;
        }

        Object.defineProperty(
          target.prototype,
          method,
          methodDecorator(target.prototype, method, descriptor),
        );

        Reflect.getMetadataKeys(originalMethod).forEach(
          (previousMetadataKey) => {
            const previousMetadata = Reflect.getMetadata(
              previousMetadataKey,
              originalMethod,
            );
            Reflect.defineMetadata(
              previousMetadataKey,
              previousMetadata,
              descriptor.value,
            );
          },
        );

        Object.defineProperty(descriptor.value, "name", {
          value: originalMethod.name,
          writable: false,
        });
      }
    });
    return target as never;
  }) as never;
};
