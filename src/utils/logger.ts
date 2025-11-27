import log from "loglevel";

log.setDefaultLevel(log.levels.INFO);

if (import.meta.env.DEV) {
  log.setLevel(log.levels.DEBUG);
}

export default log;
