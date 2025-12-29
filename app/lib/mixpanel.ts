import Mixpanel from "mixpanel";

const mixpanelEvent = Mixpanel.init(process.env.MIXPANEL_TOKEN || "");

export function trackServerEvent(eventName: string, properties: any) {
  if (process.env.NODE_ENV === "development") {
    return;
  }

  mixpanelEvent.track(eventName, properties);
}
