/// <reference types="vite-plugin-pwa/vanillajs" />
import { registerSW } from "virtual:pwa-register";
import log from "@/utils/logger";

registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl: string) {
    log.debug("sw script url", swScriptUrl);
  },
  onOfflineReady() {},
});
