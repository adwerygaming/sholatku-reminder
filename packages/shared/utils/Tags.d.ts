declare const RawTags: {
    System: {
        colors: string[];
    };
    Error: {
        colors: string[];
    };
    Debug: {
        colors: string[];
    };
    RouteLoader: {
        colors: string[];
    };
    RouteRegister: {
        colors: string[];
    };
    Express: {
        colors: string[];
    };
    ExpressLog: {
        colors: string[];
    };
    Axios: {
        colors: string[];
    };
    CommandImporter: {
        colors: string[];
    };
    CommandRegister: {
        colors: string[];
    };
    Discord: {
        colors: string[];
    };
    PrayerService: {
        colors: string[];
    };
};
type RawTagMap = typeof RawTags;
declare const tags: { [K in keyof RawTagMap]: string; };
export default tags;
