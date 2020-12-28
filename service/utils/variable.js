global.data = {};

class Variable {

    setCache(key, value) {
        global.data[key] = value;
    }

    getCache(key) {
        return global.data[key];
    }
}

module.exports = new Variable();
