import loglevel from "loglevel";

if (process.env.NODE_ENV !== "production") loglevel.setLevel("debug");

export default loglevel;
