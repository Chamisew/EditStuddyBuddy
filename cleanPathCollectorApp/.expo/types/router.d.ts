/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(routes)/dashboard` | `/(routes)/earnings` | `/(routes)/map` | `/(routes)/scanner` | `/(routes)/scanner/Overlay` | `/(routes)/schedule` | `/(routes)/updategarbage` | `/_sitemap` | `/dashboard` | `/earnings` | `/map` | `/scanner` | `/scanner/Overlay` | `/schedule` | `/theme` | `/updategarbage`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
