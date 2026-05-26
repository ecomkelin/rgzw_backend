const test = async () => {
    try {
    } catch (e) {
        throw e; // 重新抛出错误，让外层捕获
    }
}
const demo = async () => {
    try {
    } catch (e) {
        console.error(2222, e);
    }
};

module.exports = demo;